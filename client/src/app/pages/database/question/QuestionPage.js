import React, { useState, useEffect } from "react";
import { useTable } from "react-table";
import axios from "axios";

function Table({ columns, data }) {
  const {
    headers,
    getTableProps,
    getTableBodyProps,
    rows,
    prepareRow
  } = useTable({
    columns,
    data
  });

  return (
    <table className="table table-striped" {...getTableProps()}>
      <thead>
        <tr>
          <th style={{ width: "20px" }}>
            <label
              class="kt-checkbox kt-checkbox--single kt-checkbox--all kt-checkbox--solid"
              style={{ paddingLeft: 0, marginBottom: 0 }}
            >
              <input type="checkbox" />
              &nbsp;<span></span>
            </label>
          </th>
          {headers.map(column => (
            <th style={{ width: "20px" }} {...column.getHeaderProps()}>
              {column.render("Header")}
            </th>
          ))}
        </tr>
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              <td>
                <label
                  class="kt-checkbox kt-checkbox--single kt-checkbox--all kt-checkbox--solid"
                  style={{ paddingLeft: 0, marginBottom: 0 }}
                >
                  <input type="checkbox" />
                  &nbsp;<span></span>
                </label>
              </td>
              {row.cells.map(cell => {
                return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function QuestionPage() {
  const columns = [
    {
      Header: "id",
      accessor: "_id"
    },
    {
      Header: "createdAt",
      accessor: "createdAt"
    },
    {
      Header: "updatedAt",
      accessor: "updatedAt"
    },
    {
      Header: "name",
      accessor: "name"
    }
  ];

  const [data, setData] = useState([]);

  useEffect(() => {
    console.log("xx");

    axios.get("/schedules").then(response => {
      setData(response.data);
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
