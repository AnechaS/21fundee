import React, { Component } from "react";
import _ from "lodash";
import clsx from "clsx";
import moment from "moment";
import { getPeople } from "../../crud/people.crud";
import SubHeader from "../../partials/layout/SubHeader";
import FilterPeopleDropdown from "../../partials/content/CustomDropdowns/FilterPeopleDropdown";
import KTContent from "../../../_metronic/layout/KtContent";
import {
  ProfileCard,
  ProfileCardSkeleton
} from "../../widgets/general/ProfileCard";

export default class PeopleListPage extends Component {
  state = {
    isLoading: true,
    isLoadingMore: false,
    count: 0,
    offset: 1,
    limit: 40,
    items: [],
    search: "",
    filters: {
      text: ""
    }
  };

  componentDidMount() {
    this.fetchItems({ count: 1 });
  }

  fetchItems = async params => {
    try {
      // turn on spinner
      const timeout = setTimeout(() => {
        this.setState(prevState => {
          if (!prevState.isLoading) {
            return { isLoading: true };
          }
        });
      }, 1000);

      const { limit } = this.state;
      const query = {
        sort: "-createdAt",
        limit,
        ...params
      };

      const queryFromFilters = this._queryFromFilters();
      if (Object.keys(queryFromFilters).length) {
        query.where = JSON.stringify(queryFromFilters);
      }

      const response = await getPeople(query);
      const json = response.data;
      this.setState(prevState => {
        const state = {
          items: json.results
        };

        if (prevState.offset !== 1) {
          state.items = [...prevState.items, ...state.items];
        }

        if (typeof json.count !== "undefined") {
          state.count = json.count;
        }

        return state;
      });

      clearTimeout(timeout);
    } catch (error) {
      // TODO handle error
    } finally {
      // turn off spinner
      this.setState(prevState => {
        if (prevState.isLoading) {
          return { isLoading: false };
        }
      });
    }
  };

  _queryFromFilters() {
    const query = {};
    const {
      text,
      duration,
      dentalIdType,
      province,
      district
    } = this.state.filters;

    if (text) {
      query.$or = [
        {
          firstName: {
            $regex: `.*${text}.*`,
            $options: "i"
          }
        },
        {
          lastName: {
            $regex: `.*${text}.*`,
            $options: "i"
          }
        },
        {
          dentalId: {
            $regex: `.*${text}.*`,
            $options: "i"
          }
        },
        {
          childName: {
            $regex: `.*${text}.*`,
            $options: "i"
          }
        }
      ];
    }

    if (typeof duration === "object") {
      if (duration.start) {
        query.createdAt = {
          $gte: moment(duration.start)
            .startOf("day")
            .toDate()
        };
      }

      if (duration.end) {
        query.createdAt = {
          ...query.createdAt,
          $lte: moment(duration.end)
            .endOf("day")
            .toDate()
        };
      }
    }

    if (typeof dentalIdType === "boolean") {
      if (dentalIdType) {
        query.dentalId = { $regex: "^[0-9]{6}$" };
      } else {
        query.dentalId = {
          $regex: "^(?![0-9]{6}$)"
        };
      }
    }

    if (province) {
      query.province = province;
    }

    if (district) {
      query.district = district;
    }

    return query;
  }

  handleLoadMoreClick = () => {
    const { offset, limit } = this.state;
    const skip = offset * limit;
    const offsetIncrement = offset + 1;

    this.setState(
      {
        offset: offsetIncrement,
        isLoadingMore: true
      },
      () => {
        this.fetchItems({ skip }).finally(() => {
          this.setState({ isLoadingMore: false });
        });
      }
    );
  };

  handleSearch = value => {
    const { filters } = this.state;
    const newFilters = Object.assign({}, filters, { text: value });
    if (_.isEqual(filters, newFilters)) {
      return;
    }

    this.setState(
      {
        offset: 1,
        filters: newFilters
      },
      () => {
        this.fetchItems();
      }
    );
  };

  handleFilterChange = values => {
    const { filters } = this.state;
    const newFilters = Object.assign({}, _.pick(filters, ["text"]), values);
    if (_.isEqual(filters, newFilters)) {
      return;
    }

    this.setState(
      {
        offset: 1,
        filters: newFilters
      },
      () => {
        this.fetchItems({ count: 1 });
      }
    );
  };

  renderListItems = () => {
    const {
      items,
      isLoading,
      isLoadingMore,
      offset,
      limit,
      count
    } = this.state;

    // render skeletron items
    if (isLoading && !isLoadingMore) {
      return _.chunk(Array.from(Array(8).keys()), 4).map((cols, i) => (
        <div className="row" key={(i + 1).toString()}>
          {cols.map(col => (
            <div className="col-xl-3" key={(col + 1).toString()}>
              <ProfileCardSkeleton />
            </div>
          ))}
        </div>
      ));
    }

    const rows = _.chunk(items, 4);
    return (
      <>
        {rows.map((cols, i) => (
          <div className="row" key={(i + 1).toString()}>
            {cols.map(col => (
              <div className="col-xl-3" key={col._id}>
                <ProfileCard data={col} />
              </div>
            ))}
          </div>
        ))}

        {count > limit && offset * limit < count && (
          <div className="text-center">
            <button
              type="button"
              className={clsx("btn btn-light btn-wide btn-pill btn-font-lg", {
                "kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--brand": isLoading
              })}
              onClick={this.handleLoadMoreClick}
              disabled={isLoading}
            >
              โหลดข้อมูลเพิ่มเติม
            </button>
          </div>
        )}
      </>
    );
  };

  render() {
    const { count, isLoading, filters } = this.state;
    return (
      <>
        <SubHeader>
          <SubHeader.Main>
            <SubHeader.Group>
              {!isLoading && <SubHeader.Desc>{count} Total</SubHeader.Desc>}
              <SubHeader.Search onSubmit={this.handleSearch} />
              <FilterPeopleDropdown
                onFilterChange={this.handleFilterChange}
                filters={filters}
              />
            </SubHeader.Group>
          </SubHeader.Main>
        </SubHeader>
        <KTContent>{this.renderListItems()}</KTContent>
      </>
    );
  }
}
