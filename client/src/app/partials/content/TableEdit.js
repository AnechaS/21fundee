import React, {
  useState,
  useEffect,
  forwardRef,
  useRef,
  useImperativeHandle
} from "react";
import {
  useTable,
  usePagination,
  useRowSelect,
  useBlockLayout,
  useResizeColumns
} from "react-table";
import { isEqual } from "lodash";
import clsx from "clsx";
import pagination from "../../utils/pagination";
import "../../../_metronic/_assets/sass/custom/_datatable.scss";

/**
 * Data to json stringify scpace ", "
 * @param {any} o Data to be converted
 */
function Stringify_WithSpaces(o) {
  let result = JSON.stringify(o, null, 1);
  result = result.replace(/^ +/gm, " ");
  result = result.replace(/\n/g, "");
  result = result.replace(/{ /g, "{").replace(/ }/g, "}");
  result = result.replace(/\[ /g, "[").replace(/ \]/g, "]");
  return result;
}

/**
 * Conponent cell edit
 */
const Edit = ({ initialValue, edit = true, type, onBlur }) => {
  const [value, setValue] = useState("");
  const [originalValue, setOriginalValue] = useState("");
  const [editing, setEditing] = useState(false);

  // If the initialValue is changed external, sync it up with our state
  useEffect(() => {
    // Tranfrom value to string
    let tranfromValue = "";
    if (typeof initialValue !== "undefined") {
      switch (type) {
        case "Array":
          tranfromValue = Stringify_WithSpaces(initialValue);
          break;

        case "Object":
          tranfromValue = Stringify_WithSpaces(initialValue);
          break;

        case "Boolean":
          tranfromValue = initialValue.toString();
          break;

        default:
          tranfromValue = initialValue;
          break;
      }
    }

    setValue(tranfromValue);
    setOriginalValue(tranfromValue);
  }, [initialValue, type]);

  const handleDoubleClick = () => {
    if (!edit) {
      return;
    }

    setEditing(true);
  };

  const handleChange = e => {
    setValue(e.target.value);
  };

  const handleBlur = () => {
    setEditing(false);

    let val = value;
    if (type === "Array" || type === "Object") {
      // Validate value is json
      try {
        val = JSON.parse(val);
      } catch (error) {
        // error value
        setValue(originalValue);
        return;
      }
    }

    if (onBlur && typeof onBlur === "function") {
      onBlur(val);
    }
  };

  // Text placeholder
  const text = typeof initialValue !== "undefined" ? value : "(Undefined)";

  return (
    <span onDoubleClick={handleDoubleClick}>
      {!editing ? (
        text
      ) : (
        <input
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
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
  const onBlur = value => {
    if (!isEqual(value, initialValue)) {
      updateData(index, id, value);
    }
  };

  return (
    <Edit
      initialValue={initialValue}
      onBlur={onBlur}
      edit={Boolean(edit)}
      type={type}
    />
  );
};

const defaultColumn = {
  Cell: EditableCell,
  minWidth: 50,
  width: 160,
  maxWidth: 500
};

const IndeterminateCheckbox = forwardRef(({ indeterminate, ...rest }, ref) => {
  const defaultRef = useRef();
  const resolvedRef = ref || defaultRef;

  useEffect(() => {
    resolvedRef.current.indeterminate = indeterminate;
  }, [resolvedRef, indeterminate]);

  return (
    <>
      <label className="kt-checkbox kt-checkbox--single kt-checkbox--solid">
        <input type="checkbox" ref={resolvedRef} {...rest} />
        &nbsp;<span></span>
      </label>
    </>
  );
});

const Table = forwardRef(
  (
    { columns, data, showRowCreateData, createData, updateData, skipPageReset },
    ref
  ) => {
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
      state: { pageIndex, pageSize, selectedRowIds },
      ...rest
    } = useTable(
      {
        columns,
        data,
        initialState: { pageIndex: 0, pageSize: 15 },
        defaultColumn,
        autoResetPage: !skipPageReset,
        updateData
      },
      useBlockLayout,
      useResizeColumns,
      usePagination,
      useRowSelect,
      hooks => {
        hooks.visibleColumns.push(columns => [
          {
            id: "selection",
            width: 50,
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

    useImperativeHandle(ref, () => {
      return {
        selectedRowIds: selectedRowIds
      };
    });

    const start = rows.length === 0 ? 0 : Math.max(pageSize * pageIndex + 1, 1);
    const end =
      pageIndex + 1 === pageCount || rows.length === 0
        ? rows.length
        : pageSize * (pageIndex + 1);

    return (
      <div className="kt-datatable kt-datatable--default kt-datatable--brand kt-datatable--loaded">
        <div
          className="kt-datatable__table"
          {...getTableProps()}
          style={{
            display: "inline-block",
            height: page.length < 15 ? "655px" : "auto"
          }}
        >
          <div className="kt-datatable__head">
            <div
              className="kt-datatable__row __web-inspector-hide-shortcut__"
              style={{ left: "0px" }}
            >
              {headers.map(column => {
                if (column.id === "selection") {
                  return (
                    <div
                      className={
                        "kt-datatable__cell--center kt-datatable__cell kt-datatable__cell--check"
                      }
                      {...column.getHeaderProps()}
                    >
                      <span>{column.render("Header")}</span>
                    </div>
                  );
                }

                return (
                  <div
                    className={"kt-datatable__cell kt-datatable__cell--sort"}
                    {...column.getHeaderProps()}
                  >
                    <span>
                      <div className="kt-datatable__column--name">
                        {column.render("Header")}
                      </div>
                      <div className="kt-datatable__column--type">
                        {column.type}
                      </div>
                    </span>
                    <div
                      {...column.getResizerProps()}
                      className="kt-datatable__resizer"
                    ></div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="kt-datatable__body" {...getTableBodyProps()}>
            {showRowCreateData && (
              <div className="kt-datatable__row">
                <div
                  className="kt-datatable__cell--center kt-datatable__cell kt-datatable__cell--check"
                  {...headers[0].getHeaderProps()}
                >
                  <span>
                    <label className="kt-checkbox kt-checkbox--single kt-checkbox--solid kt-checkbox--disabled">
                      <input type="checkbox" disabled={true} />
                      &nbsp;<span></span>
                    </label>
                  </span>
                </div>
                {rest.columns.map(column => {
                  return (
                    <div
                      className="kt-datatable__cell kt-datatable__cell--edit"
                      {...column.getHeaderProps()}
                    >
                      <Edit
                        edit={Boolean(column.edit)}
                        onBlur={value => {
                          createData({ [column.id]: value });
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {page.map(row => {
              prepareRow(row);
              return (
                <div className="kt-datatable__row" {...row.getRowProps()}>
                  {row.cells.map(cell => {
                    if (cell.column.id === "selection") {
                      return (
                        <div
                          className="kt-datatable__cell kt-datatable__cell--center kt-datatable__cell--check"
                          {...cell.getCellProps()}
                        >
                          <span>{cell.render("Cell")}</span>
                        </div>
                      );
                    }

                    return (
                      <div
                        className={clsx("kt-datatable__cell", {
                          "kt-datatable__cell--edit": cell.column.edit
                        })}
                        {...cell.getCellProps()}
                      >
                        {cell.render("Cell")}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

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
);

export default Table;
