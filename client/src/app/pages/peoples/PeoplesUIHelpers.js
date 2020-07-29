import { useReducer, useEffect, useCallback } from "react";
import { has, isEqual, isEmpty } from "lodash";
import moment from "moment";
import { getPeople as getPeoples } from "../../crud/people.crud";

const initialState = {
  search: "",
  filters: {},
  pagin: {
    page: 0,
    pageCount: 0,
    perPage: 32,
    offset: 0
  },
  items: [],
  count: 0,
  error: null,
  loading: false,
  listLoading: false
};

function reducer(state, { type, payload }) {
  switch (type) {
    case "INIT": {
      return { ...state, ...payload };
    }

    case "FILTERS_CHANGE": {
      return {
        ...state,
        pagin: initialState.pagin,
        filters: payload
      };
    }

    case "FILTERS_CLEAR": {
      return {
        ...state,
        search: initialState.search,
        filters: initialState.filters
      };
    }

    case "SEARCH_CHANGE": {
      return {
        ...state,
        search: payload,
        pagin: initialState.pagin
      };
    }

    case "PAGE_CHANGE": {
      return {
        ...state,
        pagin: {
          ...state.pagin,
          offset: payload * state.pagin.perPage,
          page: payload
        }
      };
    }

    case "FETCH_PEOPLES_PENDING": {
      return {
        ...state,
        loading: true,
        error: null
      };
    }

    case "LOADING_LIST": {
      return {
        ...state,
        listLoading: true
      };
    }

    case "FETCH_PEOPLES_SUCCESS": {
      const { items, count } = payload;
      const { page, perPage } = state.pagin;
      return {
        ...state,
        loading: false,
        listLoading: false,
        count: count || state.count,
        items: page === 0 ? items : [...state.items, ...items],
        pagin: {
          ...state.pagin,
          pageCount: count ? Math.floor(count / perPage) : state.count
        }
      };
    }

    case "FETCH_PEOPLES_FAILURE": {
      return {
        ...state,
        error: payload
      };
    }

    default: {
      return state;
    }
  }
}

/**
 * Hook Query Peoples.
 *
 * @example
 *
 * const { state } = useQueryPeople();
 *
 * const { loadMore } = useQueryPeople();
 * => loadMore()
 *
 * const { setSearch } = useQueryPeople();
 * => setSearch('hi')
 *
 * const { setFilters, clearFilters } = useQueryPeople();
 * => setFilters({
 *      duration: { start: date, end: date },
 *      dentalIdType: bool,
 *      province: string,
 *      district: string
 *    })
 *
 * => clearFilters()
 *
 * @return {object}
 */
export function useQueryPeoples() {
  const [state, dispatch] = useReducer(reducer, { ...initialState });
  const { pagin, search, filters } = state;

  useEffect(() => {
    dispatch({
      type: "FETCH_PEOPLES_PENDING"
    });

    const query = buildQuery(
      {
        count: pagin.page === 0 ? 1 : 0,
        sort: "-createdAt",
        limit: pagin.perPage,
        skip: pagin.offset
      },
      {
        search,
        filters
      }
    );

    let timeout;
    if (!pagin.offset) {
      if (!has(query, "where")) {
        dispatch({
          type: "LOADING_LIST"
        });
      } else {
        timeout = setTimeout(() => {
          dispatch({
            type: "LOADING_LIST"
          });
        }, 1000);
      }
    }

    getPeoples(query)
      .then(({ data }) => {
        const payload = {
          items: data.results
        };

        if (data.count) {
          payload.count = data.count;
        }

        dispatch({
          type: "FETCH_PEOPLES_SUCCESS",
          payload
        });
      })
      .catch(error => {
        dispatch({
          type: "FETCH_PEOPLES_FAILURE",
          payload: error
        });
      })
      .finally(() => {
        clearTimeout(timeout);
      });
  }, [pagin.page, pagin.perPage, pagin.offset, search, filters]);

  // loading more
  const loadMore = useCallback(() => {
    return dispatch({
      type: "PAGE_CHANGE",
      payload: pagin.page + 1
    });
  }, [pagin.page]);

  // list loading
  const setFilters = useCallback(
    newFilters => {
      if (isEmpty(newFilters) || isEqual(filters, newFilters)) {
        return;
      }

      return dispatch({
        type: "FILTERS_CHANGE",
        payload: newFilters
      });
    },
    [filters]
  );

  const clearFilters = () => {
    return dispatch({
      type: "FILTERS_CLEAR"
    });
  };

  // list loading
  const setSearch = useCallback(
    (newSearch = "") => {
      newSearch = newSearch.trim();
      if (!newSearch.length || search === newSearch) {
        return;
      }

      return dispatch({
        type: "SEARCH_CHANGE",
        payload: newSearch
      });
    },
    [search]
  );

  return {
    state,
    setFilters,
    clearFilters,
    setSearch,
    loadMore
  };
}

/**
 * Make query params the api
 *
 * @example
 *
 * buildQuery(queryParam, { search: 'text' })
 * buildQuery(queryParam, { filter: { province: 'name' } })
 *
 * @param {object} query Options query
 * @param {object} state State of this page
 * @return {object} query params
 */
function buildQuery(query = {}, { search = "", filters = {} }) {
  // eslint-disable-next-line eqeqeq
  if (query.count == 0) {
    delete query.count;
  }

  const condition = {};
  if (search) {
    condition.$or = [
      {
        firstName: {
          $regex: `.*${search}.*`,
          $options: "i"
        }
      },
      {
        lastName: {
          $regex: `.*${search}.*`,
          $options: "i"
        }
      },
      {
        dentalId: {
          $regex: `.*${search}.*`,
          $options: "i"
        }
      },
      {
        childName: {
          $regex: `.*${search}.*`,
          $options: "i"
        }
      }
    ];
  }

  if (has(filters, "duration.start")) {
    condition.createdAt = {
      $gte: moment(filters.duration.start)
        .startOf("day")
        .toDate()
    };
  }

  if (has(filters, "duration.end")) {
    condition.createdAt = {
      ...condition.createdAt,
      $lte: moment(filters.duration.end)
        .endOf("day")
        .toDate()
    };
  }

  if (has(filters, "dentalIdType")) {
    if (filters.dentalIdType) {
      condition.dentalId = { $regex: "^[0-9]{6}$" };
    } else {
      condition.dentalId = {
        $regex: "^(?![0-9]{6}$)"
      };
    }
  }

  if (has(filters, "province")) {
    condition.province = filters.province;
  }

  if (has(filters, "district")) {
    condition.district = filters.district;
  }

  if (Object.keys(condition).length) {
    query.where = condition;
  }

  return query;
}
