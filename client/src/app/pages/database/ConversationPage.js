import React, { useState, useEffect } from "react";
import axios from "axios";
import Table from "../../components/Table"

export default function ConversationPage() {
  const columns = [
    {
      Header: "id",
      accessor: "_id",
      type: "ObjectId"
    },
    {
      Header: "people",
      accessor: "people._id",
      type: "Populate"
    },
    {
      Header: "schedule",
      accessor: "schedule._id",
      type: "Populate"
    },
    {
      Header: "botId",
      accessor: "botId",
      type: "String"
    },
    {
      Header: "blockId",
      accessor: "blockId",
      type: "String"
    },
    {
      Header: "text",
      accessor: "text",
      type: "String"
    },
    {
      Header: "image",
      accessor: "image",
      type: "String"
    },
    {
      Header: "reply",
      accessor: "reply",
      type: "Object"
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
    axios.get("/conversations").then(response => {
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
