import React, { useMemo, useCallback, useRef, useEffect } from "react";
import {
  useTable,
  useSortBy,
  usePagination
  /* useRowSelect, */
} from "react-table";
import PropTypes from "prop-types";
import clsx from "clsx";
import _result from "lodash/result";
import PerfectScrollbar from "perfect-scrollbar";
import pagination from "../../utils/pagination";

export const PaginTable = ({
  canPreviousPage,
  canNextPage,
  pageCount,
  gotoPage,
  nextPage,
  previousPage,
  state: { pageIndex, pageSize },
  setPageSize,
  pageSizeSelect,
  info,
  rowsCount
}) => {
  const renderInfo = useCallback(() => {
    if (!info.display) {
      return null;
    }

    const start = rowsCount === 0 ? 0 : Math.max(pageSize * pageIndex + 1, 1);
    const end =
      pageIndex + 1 === pageCount || rowsCount === 0
        ? rowsCount
        : pageSize * (pageIndex + 1);

    if (info.callback) {
      return info.callback(start, end, rowsCount);
    }

    return (
      <span className="kt-datatable__pager-detail">
        {`Showing  ${start} - ${end} of ${rowsCount}`}
      </span>
    );
  }, [info, pageSize, pageIndex, pageCount, rowsCount]);

  return (
    <div className="kt-datatable__pager kt-datatable--paging-loaded">
      <ul className="kt-datatable__pager-nav">
        <>
          <li>
            <button
              title="First"
              className={clsx(
                "kt-datatable__pager-link kt-datatable__pager-link--first",
                {
                  "kt-datatable__pager-link--disabled": !canPreviousPage
                }
              )}
              onClick={() => gotoPage(0)}
              disabled={!canPreviousPage}
            >
              <i className="flaticon2-fast-back"></i>
            </button>
          </li>
          <li>
            <button
              title="Previous"
              className={clsx(
                "kt-datatable__pager-link kt-datatable__pager-link--prev",
                {
                  "kt-datatable__pager-link--disabled": !canPreviousPage
                }
              )}
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
            >
              <i className="flaticon2-back"></i>
            </button>
          </li>
          {pagination(pageCount, pageIndex + 1).map(val => (
            <li key={`page-n-${val}`}>
              <button
                className={clsx(
                  "kt-datatable__pager-link kt-datatable__pager-link-number",
                  {
                    "kt-datatable__pager-link--active": pageIndex + 1 === val
                  }
                )}
                onClick={() => {
                  gotoPage(val - 1);
                }}
                title={val}
              >
                {val}
              </button>
            </li>
          ))}
          <li>
            <button
              title="Next"
              className={clsx(
                "kt-datatable__pager-link kt-datatable__pager-link--next",
                { "kt-datatable__pager-link--disabled": !canNextPage }
              )}
              onClick={() => nextPage()}
              disabled={!canNextPage}
            >
              <i className="flaticon2-next"></i>
            </button>
          </li>
          <li>
            <button
              title="Last"
              className={clsx(
                "kt-datatable__pager-link kt-datatable__pager-link--last",
                { "kt-datatable__pager-link--disabled": !canNextPage }
              )}
              onClick={() => gotoPage(pageCount - 1)}
              disabled={!canNextPage}
            >
              <i className="flaticon2-fast-next"></i>
            </button>
          </li>
        </>
      </ul>
      <div className="kt-datatable__pager-info">
        <select
          className="selectpicker kt-datatable__pager-size"
          data-width="60px"
          value={pageSize}
          onChange={e => {
            setPageSize(Number(e.target.value));
          }}
        >
          {pageSizeSelect.map(v => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        {info && renderInfo()}
      </div>
    </div>
  );
};

PaginTable.defaultProps = {
  canPreviousPage: false,
  canNextPage: true,
  pageSizeSelect: [10, 20, 30, 50, 100],
  info: {
    display: true
  },
  rowsCount: 0
};

PaginTable.propTypes = {
  canPreviousPage: PropTypes.bool,
  canNextPage: PropTypes.bool,
  pageCount: PropTypes.number.isRequired,
  gotoPage: PropTypes.func.isRequired,
  nextPage: PropTypes.func.isRequired,
  previousPage: PropTypes.func.isRequired,
  setPageSize: PropTypes.func.isRequired,
  state: PropTypes.shape({
    pageIndex: PropTypes.number,
    pageSize: PropTypes.number
  }).isRequired,
  pageSizeSelect: PropTypes.arrayOf(PropTypes.number),
  info: PropTypes.shape({
    display: PropTypes.bool,
    callback: PropTypes.func
  }),
  rowsCount: PropTypes.number
};

export default function Table({
  columns,
  data,
  sortable,
  layout,
  pagination,
  toolbar,
  translate,
  loading
}) {
  const theadRef = useRef(false);
  const tbodyRef = useRef(false);

  const options = useMemo(() => {
    const o = {
      data: data.source || [],
      columns,
      initialState: {}
    };

    if (pagination) {
      o.initialState.pageIndex = data.pageIndex || 0;
      o.initialState.pageSize = data.pageSize || 10;
    }

    return o;
  }, [data, columns, pagination]);

  const instance = useTable(
    {
      ...options
    },
    useSortBy,
    usePagination
  );

  const tableProps = useCallback(
    (props, { column }) => {
      const newProps = Object.assign({}, props);

      newProps.style = {
        display: "block"
      };

      if (layout.height) {
        newProps.style = {
          ...newProps.style,
          maxHeight: `${layout.height}px`
        };
      }

      return newProps;
    },
    [layout]
  );

  const headerProps = useCallback(
    (props, { column }) => {
      let newProps = { ...props };

      if (sortable) {
        newProps = { ...props, ...column.getSortByToggleProps() };
      }

      return newProps;
    },
    [sortable]
  );

  const bodyProps = useCallback(
    (props, { column }) => {
      const newProps = Object.assign({}, props);

      if (layout.height && layout.scroll) {
        const theadHeight = theadRef.current.offsetHeight;

        let bodyHeight = layout.height;
        if (theadHeight > 0) {
          bodyHeight -= theadHeight;
        }

        // TODO find height footer
        // const tfootHeight
        // if (tfootHeight > 0) {
        //   bodyHeight -= tfootHeight;
        // }

        // scrollbar offset
        bodyHeight -= 2;

        newProps.style = {
          maxHeight: Math.floor(parseFloat(bodyHeight))
        };
      }

      return newProps;
    },
    [layout]
  );

  useEffect(() => {
    let ps;
    if (layout.height && layout.scroll) {
      ps = new PerfectScrollbar(tbodyRef.current, {
        wheelSpeed: 0.5,
        swipeEasing: true,
        // wheelPropagation: false,
        minScrollbarLength: 40,
        maxScrollbarLength: 300
        // suppressScrollX: true
      });
    }

    return () => {
      ps.destroy();
    };
  }, [layout]);

  const infoCallback = useMemo(() => {
    let func;
    const o = _result(translate, "toolbar.pagination.items");
    if (o && Object.hasOwnProperty.call(o, "info")) {
      func = o.info;
    }

    return func;
  }, [translate]);

  const rows = pagination ? instance.page : instance.rows;

  return (
    <div
      className={clsx(
        "kt-datatable kt-datatable--default kt-datatable--brand kt-datatable--loaded"
      )}
    >
      <table
        className="kt-datatable__table"
        {...instance.getTableProps(tableProps)}
      >
        <thead className="kt-datatable__head" ref={theadRef}>
          <tr className="kt-datatable__row">
            {instance.headers.map(column => {
              return (
                <th
                  className={clsx("kt-datatable__cell", {
                    "kt-datatable__cell--sort": Boolean(
                      column.sortable || true
                    ),
                    "kt-datatable__cell--sorted": column.isSorted
                  })}
                  {...column.getHeaderProps(
                    // sortable ? column.getSortByToggleProps() : undefined
                    headerProps
                  )}
                >
                  <span style={{ width: column.width }}>
                    {column.render("Header")}
                    {column.isSorted && (
                      <i
                        className={clsx({
                          "flaticon2-arrow-down": column.isSortedDesc,
                          "flaticon2-arrow-up": !column.isSortedDesc
                        })}
                      ></i>
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody
          className="kt-datatable__body"
          {...instance.getTableBodyProps(bodyProps)}
          ref={tbodyRef}
        >
          {Boolean(data.source.length) &&
            rows.map((row, i) => {
              instance.prepareRow(row);
              return (
                <tr className="kt-datatable__row" {...row.getRowProps()}>
                  {row.cells.map(cell => {
                    return (
                      <td
                        className="kt-datatable__cell"
                        {...cell.getCellProps()}
                      >
                        <span style={{ width: cell.column.width }}>
                          {!cell.column.hasOwnProperty("template")
                            ? cell.render("Cell")
                            : cell.column.template(cell.row.original, i)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}

          {Boolean(!data.source.length && !loading) && (
            <tr
              style={{
                display: "flex",
                justifyContent: "center",
                margin: "30px"
              }}
            >
              <td>
                <span>No data to display</span>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {pagination && (
        <PaginTable
          canPreviousPage={instance.canPreviousPage}
          canNextPage={instance.canNextPage}
          pageCount={instance.pageCount}
          gotoPage={instance.gotoPage}
          nextPage={instance.nextPage}
          previousPage={instance.previousPage}
          setPageSize={instance.setPageSize}
          state={{
            pageIndex: instance.state.pageIndex,
            pageSize: instance.state.pageSize
          }}
          rowsCount={instance.rows.length}
          info={{
            display: _result(toolbar, "items.info", true),
            callback: infoCallback
          }}
        />
      )}
    </div>
  );
}

Table.defaultProps = {
  columns: [],
  data: {
    source: []
  },
  layout: {},
  sortable: false,
  toolbar: {},
  translate: {},
  loading: false
};

Table.propTypes = {
  column: PropTypes.array,
  data: PropTypes.shape({
    source: PropTypes.array,
    pageSize: PropTypes.number,
    pageIndex: PropTypes.number
  }),
  layout: PropTypes.shape({
    scroll: PropTypes.bool,
    height: PropTypes.number,
    footer: PropTypes.bool
  }),
  sortable: PropTypes.bool,
  toolbar: PropTypes.shape({
    layout: PropTypes.shape({}),
    items: PropTypes.shape({
      pagination: PropTypes.shape({}),
      info: PropTypes.bool
    })
  }),
  translate: PropTypes.shape({
    toolbar: PropTypes.shape({
      pagination: PropTypes.shape({
        items: PropTypes.shape({
          info: PropTypes.func
        })
      })
    })
  }),
  loading: PropTypes.bool
};
