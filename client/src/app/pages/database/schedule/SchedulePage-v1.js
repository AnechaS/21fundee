import React, { useState, useEffect } from "react";
import { useTable, usePagination } from "react-table";
import axios from "axios";

function Table({ columns, data }) {
  const {
    headers,
    getTableProps,
    getTableBodyProps,
    rows,
    prepareRow
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0 }
    },
    usePagination
  );

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
                  // style={{ paddingLeft: 0, marginBottom: 0 }}
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
                <span className="kt-datatable__head-cell-text">
                  <div className="kt-datatable__head-cell-text--name">
                    {column.render("Header")}
                  </div>
                  <div className="kt-datatable__head-cell-text--type">
                    {column.render("type")}
                  </div>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="kt-datatable__body" {...getTableBodyProps()}>
          {rows.map((row, i) => {
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
                    <td className="kt-datatable__cell" {...cell.getCellProps()}>
                      <span style={{ width: "200px" }}>
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
              className="kt-datatable__pager-link kt-datatable__pager-link--first kt-datatable__pager-link--disabled"
              data-page="1"
              disabled="disabled"
            >
              <i className="flaticon2-fast-back"></i>
            </button>
          </li>
          <li>
            <button
              title="Previous"
              className="kt-datatable__pager-link kt-datatable__pager-link--prev kt-datatable__pager-link--disabled"
              data-page="1"
              disabled="disabled"
            >
              <i className="flaticon2-back"></i>
            </button>
          </li>
          <li>
            <button
              className="kt-datatable__pager-link kt-datatable__pager-link-number kt-datatable__pager-link--active"
              data-page="1"
              title="1"
            >
              1
            </button>
          </li>
          <li>
            <button
              className="kt-datatable__pager-link kt-datatable__pager-link-number"
              data-page="2"
              title="2"
            >
              2
            </button>
          </li>
          <li>
            <button
              className="kt-datatable__pager-link kt-datatable__pager-link-number"
              data-page="3"
              title="3"
            >
              3
            </button>
          </li>
          <li></li>
          <li>
            <button
              title="Next"
              className="kt-datatable__pager-link kt-datatable__pager-link--next"
              data-page="2"
            >
              <i className="flaticon2-next"></i>
            </button>
          </li>
          <li>
            <button
              title="Last"
              className="kt-datatable__pager-link kt-datatable__pager-link--last"
              data-page="8"
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
              data-container="body"
              data-selected="15"
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
            Showing 26 - 30 of 40
          </span>
        </div>
      </div>
    </>
  );
}

export default function QuestionPage() {
  const columns = [
    {
      Header: "id",
      accessor: "_id",
      type: "ObjectId"
    },
    {
      Header: "createdAt",
      accessor: "createdAt",
      type: "Date"
    },
    {
      Header: "updatedAt",
      accessor: "updatedAt",
      type: "Date"
    },
    {
      Header: "name",
      accessor: "name",
      type: "String"
    }
  ];

  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("/schedules").then(response => {
      setData(response.data.splice(0, 16));
    });
  }, []);

  return (
    <div className="kt-portlet kt-portlet--mobile">
      <div className="kt-portlet__body kt-portlet__body--fit">
        <div className="kt-datatable kt-datatable--default kt-datatable--brand kt-datatable--loaded">
          <Table data={data} columns={columns} />
        </div>
      </div>
    </div>
  );
}
