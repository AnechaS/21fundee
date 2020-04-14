import React, { Component, createRef } from "react";
import BlockUi from "react-block-ui";
import SubHeader from "../../partials/layout/SubHeader";
import { ReactComponent as PlusIcon } from "../../../_metronic/layout/assets/layout-svg-icons/Plus.svg";
import { ReactComponent as UpdateIcon } from "../../../_metronic/layout/assets/layout-svg-icons/Update.svg";
import { ReactComponent as FilterIcon } from "../../../_metronic/layout/assets/layout-svg-icons/Filter.svg";
import { ReactComponent as WriteIcon } from "../../../_metronic/layout/assets/layout-svg-icons/Write.svg";
import KTContent from "../../../_metronic/layout/KtContent";
import Table from "../../components/Table";
import {
  getPeople,
  deletePeople,
  updatePeople,
  createPeople
} from "../../crud/people.crud";

export default class People extends Component {
  columns = [
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

  state = {
    data: [],
    isLoading: true,
    isCreatingData: false,
    skipPageReset: false
  };

  tableRef = createRef();

  componentDidMount() {
    this.fetchData();

    document.addEventListener("keydown", this.handleKeyDown, false);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown, false);
  }

  // TODO handle error
  createData = async body => {
    this.setState({ isLoading: true });
    const response = await createPeople(body);
    this.setState(prevState => ({
      isCreatingData: false,
      isLoading: false,
      data: [response.data, ...prevState.data]
    }));
  };

  // TODO Query with uri parameter
  fetchData = async () => {
    try {
      this.setState({ isLoading: true });
      const response = await getPeople();

      this.setState({ data: response.data, isLoading: false });
    } catch (error) {
      // TODO handle error
      this.setState({ isLoading: false });
    }
  };

  handleCreateDataClick = () => {
    this.setState({ isCreatingData: true });
  };

  handleDeleteDataClick = () => {
    this.deleteData();
  };

  handleDeleteAllDataClick = () => {
    // TODO delete all data
  };

  handleKeyDown = e => {
    if (e.keyCode === 27) {
      this.setState({ isCreatingData: false });
    }
  };

  handleRefreshClick = () => {
    this.setState({ isCreatingData: false });
    this.fetchData();
  };

  updateData = async (rowIndex, column, value) => {
    this.setState({ skipPageReset: true, isLoading: true });

    const { data } = this.state;

    try {
      const newData = [...data];
      newData[rowIndex] = { ...data[rowIndex], [column]: value };
      this.setState({ data: newData });

      /* const response =  */ await updatePeople(data[rowIndex]._id, {
        [column]: value
      });
    } catch (error) {
      this.setState({ data });
    }

    this.setState({ skipPageReset: false, isLoading: false });
  };

  deleteData = async () => {
    const { data } = this.state;
    const selectedRowIds = this.tableRef.current.selectedRowIds;
    const indexes = Object.keys(selectedRowIds).map(v => Number(v));
    if (!indexes.length) {
      return;
    }

    this.setState({
      skipPageReset: true,
      isLoading: true
    });

    const promise = [];
    const newData = [];
    data.forEach((o, i) => {
      if (indexes.includes(i)) {
        const response = deletePeople(o._id);
        promise.push(response);
      } else {
        newData.push(o);
      }
    });

    /* const response = */ await Promise.all(promise);
    this.setState({ data: newData });
    this.setState({
      skipPageReset: false,
      isLoading: false
    });
  };

  render() {
    const { data, skipPageReset, isCreatingData, isLoading } = this.state;

    return (
      <>
        <SubHeader>
          <SubHeader.Main>
            <SubHeader.Group>
              <SubHeader.Desc>{data.length} Total</SubHeader.Desc>
              {/* <SubHeader.Search /> */}
            </SubHeader.Group>
          </SubHeader.Main>
          <SubHeader.Toolbar>
            <SubHeader.Button
              color="secondary"
              title="Add Row"
              disabled={true}
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
                <SubHeader.Dropdown.Item
                  disabled={true}
                  onClick={this.handleCreateDataClick}
                >
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
              <BlockUi tag="div" blocking={isLoading}>
                <Table
                  ref={this.tableRef}
                  data={data}
                  columns={this.columns}
                  skipPageReset={skipPageReset}
                  showRowCreateData={isCreatingData}
                  createData={this.createData}
                  updateData={this.updateData}
                />
              </BlockUi>
            </div>
          </div>
        </KTContent>
      </>
    );
  }
}
