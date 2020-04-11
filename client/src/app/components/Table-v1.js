import React, { useState, useEffect, forwardRef, useRef } from "react";
import { useTable, usePagination, useRowSelect } from "react-table";
import clsx from "clsx";
import pagination from "../utils/pagination";

const textUndifined = "(Undefined)";

const Edit = ({ initialValue, disabled = true, type, onBlurInput }) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const [editing, setEditing] = useState(false);

  let val;
  switch (type) {
    case "Array":
      val = JSON.stringify(value);
      break;

    case "Boolean":
      val = typeof value !== "undefined" ? value.toString() : "";
      break;

    default:
      val = value;
      break;
  }

  return (
    <span
      style={{ width: "180px" }}
      {...{
        onDoubleClick: disabled
          ? () => {
              setEditing(true);
            }
          : undefined
      }}
    >
      {!editing ? (
        typeof val === "undefined" ? (
          textUndifined
        ) : (
          val
        )
      ) : (
        <input
          value={val || ""}
          onChange={e => {
            setValue(e.target.value);
          }}
          onBlur={() => {
            setEditing(false);
            if (onBlurInput && typeof onBlurInput === "function") {
              onBlurInput(val);
            }
          }}
          autoFocus
        />
      )}
    </span>
  );
};

const EditableCell = ({
  value: initialValue,
  row: { index },
  column: { id, type, edit },
  updateData
}) => {
  const onBlurInput = value => {
    updateData(index, id, value);
  };

  return (
    <Edit
      initialValue={initialValue}
      onBlurInput={onBlurInput}
      disabled={Boolean(edit)}
      type={type}
    />
  );
};

const defaultColumn = {
  Cell: EditableCell
  // width: 180
};

const IndeterminateCheckbox = forwardRef(({ indeterminate, ...rest }, ref) => {
  const defaultRef = useRef();
  const resolvedRef = ref || defaultRef;

  useEffect(() => {
    resolvedRef.current.indeterminate = indeterminate;
  }, [resolvedRef, indeterminate]);

  return (
    <>
      <label
        className="kt-checkbox kt-checkbox--single kt-checkbox--solid"
        style={{ paddingLeft: 0, marginBottom: 0 }}
      >
        <input type="checkbox" ref={resolvedRef} {...rest} />
        &nbsp;<span></span>
      </label>
    </>
  );
});

export default function Table({
  columns,
  data,
  showRowCreateData,
  createData,
  updateData,
  onSelectedRows
}) {
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
    // selectedFlatRows,
    state: { pageIndex, pageSize, selectedRowIds }
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 15 },
      defaultColumn,
      updateData
    },
    usePagination,
    useRowSelect,
    hooks => {
      hooks.visibleColumns.push(columns => [
        {
          id: "selection",
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
          ),
          Cell: ({ row }) => (
            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
          )
        },
        ...columns
      ]);
    }
  );

  useEffect(() => {
    onSelectedRows(selectedRowIds);
  }, [selectedRowIds, onSelectedRows]);

  const start = rows.length === 0 ? 0 : Math.max(pageSize * pageIndex + 1, 1);
  const end =
    pageIndex + 1 === pageCount || rows.length === 0
      ? rows.length
      : pageSize * (pageIndex + 1);

  return (
    <div className="kt-datatable kt-datatable--default kt-datatable--brand kt-datatable--loaded">
      {/* <pre>
        <code>
          {JSON.stringify(
            {
              pageIndex,
              pageSize,
              pageCount,
              canNextPage,
              canPreviousPage,
              selectedRowIds: selectedRowIds,
              "selectedFlatRows[].original": selectedFlatRows.map(
                d => d.original
              )
            },
            null,
            2
          )}
        </code>
      </pre> */}

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
            {headers.map(column => {
              if (column.id === "selection") {
                return (
                  <th
                    className={
                      "kt-datatable__cell--center kt-datatable__cell kt-datatable__cell--check"
                    }
                    {...column.getHeaderProps()}
                  >
                    <span>{column.render("Header")}</span>
                  </th>
                );
              }

              return (
                <th
                  className={"kt-datatable__cell kt-datatable__cell--sort"}
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
                      {column.type}
                    </div>
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="kt-datatable__body" {...getTableBodyProps()}>
          {showRowCreateData && (
            <tr className="kt-datatable__row">
              <td className="kt-datatable__cell--center kt-datatable__cell kt-datatable__cell--check">
                <span>
                  <label className="kt-checkbox kt-checkbox--single kt-checkbox--solid kt-checkbox--disabled">
                    <input type="checkbox" disabled={true} />
                    &nbsp;<span></span>
                  </label>
                </span>
              </td>
              {columns.map(({ accessor, edit }, index) => (
                <td
                  key={(index + 1).toString()}
                  className="kt-datatable__cell kt-datatable__cell--edit"
                >
                  <Edit
                    disabled={Boolean(edit)}
                    onBlurInput={value => {
                      createData({ [accessor]: value });
                    }}
                  />
                </td>
              ))}
            </tr>
          )}

          {page.map(row => {
            prepareRow(row);
            return (
              <tr className="kt-datatable__row" {...row.getRowProps()}>
                {row.cells.map(cell => {
                  if (cell.column.id === "selection") {
                    return (
                      <td
                        className="kt-datatable__cell kt-datatable__cell--center kt-datatable__cell--check"
                        {...cell.getCellProps()}
                      >
                        <span>{cell.render("Cell")}</span>
                      </td>
                    );
                  }

                  return (
                    <td
                      className={clsx("kt-datatable__cell", {
                        "kt-datatable__cell--edit": cell.column.edit
                      })}
                      {...cell.getCellProps()}
                    >
                      {cell.render("Cell")}
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
          {data.length >= pageSize && (
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
                      {
                        "kt-datatable__pager-link--active":
                          pageIndex + 1 === val
                      }
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
            </>
          )}
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
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
            <option value="30">30</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span className="kt-datatable__pager-detail">
            {`Showing  ${start} - ${end} of ${rows.length}`}
          </span>
        </div>
      </div>
    </div>
  );
}
