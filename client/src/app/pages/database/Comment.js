import React, { Component } from "react";
import SubHeader from "../../partials/layout/SubHeaderDatabase";
import KTContent from "../../../_metronic/layout/KtContent";
import Table from "../../partials/content/TableEdit";
import queryFromFilters from "../../utils/queryFromFilters";
import {
  getComment,
  createComment,
  updateComment,
  deleteComment
} from "../../crud/comment.crud";

export default class Comment extends Component {
  columns = [
    {
      Header: "_id",
      accessor: "_id",
      type: "ObjectId"
    },
    {
      Header: "people",
      accessor: "people",
      type: "Populate"
    },
    {
      Header: "question",
      accessor: "question",
      type: "Populate"
    },
    {
      Header: "answer",
      accessor: "answer",
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
    isLoading: true,
    count: 0,
    data: [],
    selectRows: [],
    pageIndex: 0,
    limit: 15,
    isCreating: false,
    skipPageReset: false,
    filters: []
  };

  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
    this.fetchData({ count: 1 });
    document.addEventListener("keydown", this.handleKeyDown, false);
  }

  componentWillUnmount() {
    this._isMounted = false;
    document.removeEventListener("keydown", this.handleKeyDown, false);
  }

  fetchData = async params => {
    try {
      // turn on spinner
      this.setState(prevState => {
        if (!prevState.isLoading) {
          return { isLoading: true };
        }
      });

      const { limit, pageIndex } = this.state;
      const query = {
        sort: "-createdAt",
        skip: pageIndex * limit,
        limit,
        ...params
      };
      const response = await getComment(query);
      const json = response.data;
      if (this._isMounted) {
        const state = {
          data: json.results
        };

        if (typeof json.count !== "undefined") {
          state.count = json.count;
        }

        this.setState(state);
      }
    } catch (error) {
      // TODO handle error
    } finally {
      // turn off spinner
      this.setState(prevState => {
        if (prevState.isLoading) {
          return { isLoading: false };
        }
      });
    }
  };

  handleCreate = async object => {
    try {
      await createComment(object);
      await this.fetchData({ count: 1 });
      this.setState({ isCreating: false });
    } catch (error) {
      // TODO handle error create method
    }
  };

  handleUpdate = async (rowIndex, column, value) => {
    try {
      const { data } = this.state;
      if (data[rowIndex][column] === value) {
        return;
      }

      const object = data[rowIndex];
      const newData = data.slice();
      newData[rowIndex] = { ...object, [column]: value };
      this.setState({ data: newData, skipPageReset: true });
      await updateComment(object._id, {
        [column]: value
      });
    } catch (error) {
      // TODO handle error update method
    }
  };

  handleDelete = async () => {
    try {
      const { data, selectRows } = this.state;
      if (!selectRows.length) {
        return;
      }

      const promise = selectRows.map(rowIndex =>
        deleteComment(data[rowIndex]._id)
      );
      await Promise.all(promise);
      await this.fetchData({ count: 1 });
    } catch (error) {
      // TODO handle error delete moethod
    }
  };

  handleCheckRows = rows => {
    this.setState({ selectRows: rows });
  };

  handlePagingChange = pageIndex => {
    this.setState({ pageIndex, isCreating: false }, () => {
      this.fetchData();
    });
  };

  handlePageSizeChange = value => {
    this.setState({ limit: value }, () => {
      this.fetchData();
    });
  };

  handleAddRow = () => {
    this.setState({ isCreating: true });
  };

  handleKeyDown = e => {
    if (e.keyCode === 27) {
      this.setState({ isCreating: false });
    }
  };

  handleRefresh = () => {
    this.setState({ isCreating: false });
    this.fetchData();
  };

  handleFilterChange = filters => {
    this.setState({ filters });
    const query = queryFromFilters(filters);
    this.fetchData({ where: query, count: 1 });
  };

  render() {
    const {
      data,
      count,
      skipPageReset,
      isCreating,
      isLoading,
      limit,
      pageIndex,
      filters
    } = this.state;
    return (
      <>
        <SubHeader
          loading={isLoading}
          count={count}
          columns={this.columns}
          filters={filters}
          onAddRow={this.handleAddRow}
          onRefresh={this.handleRefresh}
          onDeleteRows={this.handleDelete}
          onFilterChange={this.handleFilterChange}
        />
        <KTContent>
          <div className="kt-portlet kt-portlet--mobile">
            <div className="kt-portlet__body kt-portlet__body--fit">
              <Table
                pageSize={limit}
                pageIndex={pageIndex}
                pageCount={count}
                data={data}
                columns={this.columns}
                skipPageReset={skipPageReset}
                onCheckRows={this.handleCheckRows}
                onPagingChange={this.handlePagingChange}
                onPageSizeChange={this.handlePageSizeChange}
                showRowCreate={isCreating}
                onCreate={this.handleCreate}
                onUpdate={this.handleUpdate}
                loading={isLoading}
                minHeight={660}
              />
            </div>
          </div>
        </KTContent>
      </>
    );
  }
}
