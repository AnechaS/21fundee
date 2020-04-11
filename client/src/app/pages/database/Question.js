import React, { Component } from "react";
import axios from "axios";
import SubHeader from "../../partials/layout/SubHeader";
import { ReactComponent as PlusIcon } from "../../../_metronic/layout/assets/layout-svg-icons/Plus.svg";
import { ReactComponent as UpdateIcon } from "../../../_metronic/layout/assets/layout-svg-icons/Update.svg";
import { ReactComponent as FilterIcon } from "../../../_metronic/layout/assets/layout-svg-icons/Filter.svg";
import { ReactComponent as WriteIcon } from "../../../_metronic/layout/assets/layout-svg-icons/Write.svg";
import KTContent from "../../../_metronic/layout/KtContent";
import Table from "../../components/Table";

export default class Question extends Component {
  columns = [
    {
      Header: "id",
      accessor: "_id",
      type: "ObjectId"
    },
    {
      Header: "name",
      accessor: "name",
      type: "String",
      edit: true
    },
    {
      Header: "correctAnswers",
      accessor: "correctAnswers",
      type: "Array",
      edit: true
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

  state = {
    data: [],
    isCreatingData: false,
    selectedRowIds: {}
  };

  componentDidMount() {
    axios.get("/questions").then(response => {
      this.setState({ data: response.data });
    });

    document.addEventListener("keydown", this.handleKeyDown, false);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown, false);
  }

  createData = data => {
    this.setState({ isCreatingData: false });
    console.log("Call method createData");

    // setData(prev => [{ _id: "1234", ...data }, ...prev]);
  };

  handleCreateDataClick = () => {
    this.setState({ isCreatingData: true });
    console.log("Call method handleCreateDataClick");
  };

  handleDeleteDataClick = () => {
    const { selectedRowIds } = this.state;
    if (!selectedRowIds.length) {
      return;
    }

    console.log("Call method handleDeleteDataClick: ", selectedRowIds);
  };

  handleDeleteAllDataClick = () => {
    console.log("Call method handleDeleteAllDataClick");
  };

  handleKeyDown = e => {
    if (e.keyCode === 27) {
      this.setState({ isCreatingData: false });
    }
  };

  handleRefreshClick = () => {
    console.log("Call method handleRefreshClick");
  };

  handleSelectedRowIdsChange = o => {
    this.setState({ selectedRowIds: o });
    console.log("Call method handleSelectedRowIdsChange");
  };

  updateData = (rowIndex, column, value) => {
    console.log("Call method updateData");

    this.setState(({ data }) => {
      const newData = data.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...data[rowIndex],
            [column]: value
          };
        }
        return row;
      });
      return { data: newData };
    });
  };

  render() {
    const { data, isCreatingData } = this.state;
    return (
      <>
        <SubHeader>
          <SubHeader.Main>
            <SubHeader.Group>
              <SubHeader.Desc>{data.length} Total</SubHeader.Desc>
              <SubHeader.Search />
            </SubHeader.Group>
          </SubHeader.Main>
          <SubHeader.Toolbar>
            <SubHeader.Button
              color="secondary"
              title="Add Row"
              onClick={this.handleCreateDataClick}
            >
              <PlusIcon className="kt-svg-icon kt-svg-icon-sm" />
              &nbsp; Add Row
            </SubHeader.Button>
            <SubHeader.Button
              color="secondary"
              title="Refresh"
              onClick={this.handleRefreshClick}
            >
              <UpdateIcon className="kt-svg-icon kt-svg-icon-sm" />
              &nbsp; Refresh
            </SubHeader.Button>
            <SubHeader.Button color="secondary" title="Filter">
              <FilterIcon className="kt-svg-icon kt-svg-icon-sm" />
              &nbsp; Filter
            </SubHeader.Button>
            <SubHeader.Dropdown title="Edit">
              <SubHeader.Dropdown.Toggle color="secondary">
                <WriteIcon className="kt-svg-icon kt-svg-icon--sm" />
                &nbsp; Edit
              </SubHeader.Dropdown.Toggle>
              <SubHeader.Dropdown.Menu style={{ width: "200px" }}>
                <SubHeader.Dropdown.Item onClick={this.handleCreateDataClick}>
                  Add a row
                </SubHeader.Dropdown.Item>
                <SubHeader.Dropdown.Divider />
                <SubHeader.Dropdown.Item onClick={this.handleDeleteDataClick}>
                  Delete these rows
                </SubHeader.Dropdown.Item>
                <SubHeader.Dropdown.Item
                  onClick={this.handleDeleteAllDataClick}
                >
                  Delete all rows
                </SubHeader.Dropdown.Item>
                <SubHeader.Dropdown.Divider />
                <SubHeader.Dropdown.Item>Import data</SubHeader.Dropdown.Item>
                <SubHeader.Dropdown.Item>
                  Export this data
                </SubHeader.Dropdown.Item>
              </SubHeader.Dropdown.Menu>
            </SubHeader.Dropdown>
          </SubHeader.Toolbar>
        </SubHeader>
        <KTContent>
          <div className="kt-portlet kt-portlet--mobile">
            <div className="kt-portlet__body kt-portlet__body--fit">
              <div className="kt-datatable kt-datatable--default kt-datatable--brand kt-datatable--loaded">
                <Table
                  data={data}
                  columns={this.columns}
                  showRowCreateData={isCreatingData}
                  createData={this.createData}
                  updateData={this.updateData}
                  onSelectedRows={this.handleSelectedRowIdsChange}
                />
              </div>
            </div>
          </div>
        </KTContent>
      </>
    );
  }
}
