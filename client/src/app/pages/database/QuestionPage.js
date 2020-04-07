import React, { useState, useEffect } from "react";
import axios from "axios";
import Table from "../../components/Table"

export default function QuestionPage() {
  const columns = [
    {
      Header: "id",
      accessor: "_id",
      type: "ObjectId"
    },
    {
      Header: "name",
      accessor: "name",
      type: "String"
    },
    {
      Header: "correctAnswers",
      accessor: "correctAnswers",
      type: "Array"
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
    }
  ];

  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("/questions").then(response => {
      setData(response.data);
    });
  }, []);

  const updateMyData = (rowIndex, column, value) => {
    setData(old =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...old[rowIndex],
            [column]: value
          };
        }
        return row;
      })
    );
  };

  return (
    <div className="kt-portlet kt-portlet--mobile">
      <div className="kt-portlet__body kt-portlet__body--fit">
        <div className="kt-datatable kt-datatable--default kt-datatable--brand kt-datatable--loaded">
          <Table data={data} columns={columns} updateMyData={updateMyData} />
        </div>
      </div>
    </div>
  );
}
