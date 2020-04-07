import React, { useState, useEffect } from "react";
import axios from "axios";
import Table from "../../components/Table"

export default function PeoplePage() {
  const columns = [
    {
      Header: "id",
      accessor: "_id",
      type: "ObjectId"
    },
    {
      Header: "firstName",
      accessor: "firstName",
      type: "String"
    },
    {
      Header: "lastName",
      accessor: "lastName",
      type: "String"
    },
    {
      Header: "gender",
      accessor: "gender",
      type: "String"
    },
    {
      Header: "profilePicUrl",
      accessor: "profilePicUrl",
      type: "String"
    },
    {
      Header: "province",
      accessor: "province",
      type: "String"
    },
    {
      Header: "district",
      accessor: "district",
      type: "String"
    },
    {
      Header: "dentalId",
      accessor: "dentalId",
      type: "String"
    },
    {
      Header: "childName",
      accessor: "childName",
      type: "String"
    },
    {
      Header: "childBirthday",
      accessor: "childBirthday",
      type: "String"
    },
    {
      Header: "botId",
      accessor: "botId",
      type: "String"
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
    axios.get("/peoples").then(response => {
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
