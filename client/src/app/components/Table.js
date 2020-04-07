import React from "react";
import { useTable, usePagination } from "react-table";
import clsx from "clsx";
import pagination from "../utils/pagination";

const columnNotEdits = ["_id", "createdAt", "updatedAt"];

// Create an editable cell renderer
const EditableCell = ({
  value: initialValue,
  row: { index },
  column: { id, type },
  updateMyData
}) => {
  const [value, setValue] = React.useState(initialValue);

  const onChange = e => {
    setValue(e.target.value);
  };

  const onBlur = () => {
    updateMyData(index, id, value);
  };

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  if (columnNotEdits.includes(id)) {
    return value;
  }

  let newValue = value;
  if (type === "Array") {
    newValue = JSON.stringify(value);
  }
  return <input value={newValue} onChange={onChange} onBlur={onBlur} />;
};

const defaultColumn = {
  Cell: EditableCell
};

export default function Table({ columns, data, updateMyData }) {
  const {
    headers,
    getTableProps,
    getTableBodyProps,
    rows,
    prepareRow,
    page,
    pageCount,
    canPreviousPage,
    canNextPage,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize }
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 15 },
      defaultColumn,
      updateMyData
    },
    usePagination
  );

  const start = rows.length === 0 ? 0 : Math.max(pageSize * pageIndex + 1, 1);
  const end =
    pageIndex + 1 === pageCount || rows.length === 0
      ? rows.length
      : pageSize * (pageIndex + 1);
  return (
    <>
      <table
        className="kt-datatable__table"
        {...getTableProps()}
        style={{ display: "block" }}
      >
        <thead className="kt-datatable__head">
          <tr
            className="kt-datatable__row __web-inspector-hide-shortcut__"
            style={{ left: "0px" }}
          >
            <th
              className="kt-datatable__cell--center kt-datatable__cell kt-datatable__cell--check"
              style={{ width: "20px" }}
            >
              <span style={{ width: "20px" }}>
                <label
                  className="kt-checkbox kt-checkbox--single kt-checkbox--all kt-checkbox--solid"
                  style={{ paddingLeft: 0, marginBottom: 0 }}
                >
                  <input type="checkbox" />
                  &nbsp;<span></span>
                </label>
              </span>
            </th>
            {headers.map(column => (
              <th
                className="kt-datatable__cell kt-datatable__cell--sort"
                {...column.getHeaderProps()}
              >
                <span
                  className="kt-datatable__head-text"
                  style={{ width: "180px" }}
                >
                  <div className="kt-datatable__head-text--name">
                    {column.render("Header")}
                  </div>
                  <div className="kt-datatable__head-text--type">
                    {column.render("type")}
                  </div>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="kt-datatable__body" {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <tr className="kt-datatable__row" {...row.getRowProps()}>
                <td
                  className="kt-datatable__cell--center kt-datatable__cell kt-datatable__cell--check"
                  style={{ width: "20px" }}
                >
                  <span style={{ width: "20px" }}>
                    <label className="kt-checkbox kt-checkbox--single kt-checkbox--solid">
                      <input type="checkbox" value="29" />
                      &nbsp;<span></span>
                    </label>
                  </span>
                </td>
                {row.cells.map(cell => {
                  return (
                    <td
                      className="kt-datatable__cell kt-datatable__cell--input"
                      {...cell.getCellProps()}
                    >
                      <span style={{ width: "180px" }}>
                        {cell.render("Cell")}
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="kt-datatable__pager kt-datatable--paging-loaded">
        <ul className="kt-datatable__pager-nav">
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
                { "kt-datatable__pager-link--disabled": !canPreviousPage }
              )}
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
            >
              <i className="flaticon2-back"></i>
            </button>
          </li>
          {pagination(pageCount, pageIndex + 1).map((val, i) => (
            <li key={`page-n-${val}`}>
              <button
                className={clsx(
                  "kt-datatable__pager-link kt-datatable__pager-link-number",
                  { "kt-datatable__pager-link--active": pageIndex + 1 === val }
                )}
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
        </ul>

        <div className="kt-datatable__pager-info">
          <div
            className="dropdown bootstrap-select kt-datatable__pager-size dropup"
            style={{ width: "60px" }}
          >
            <select
              className="selectpicker kt-datatable__pager-size"
              data-width="60px"
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
              }}
            >
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          <span className="kt-datatable__pager-detail">
            {`Showing  ${start} - ${end} of ${rows.length}`}
          </span>
        </div>
      </div>
    </>
  );
}
