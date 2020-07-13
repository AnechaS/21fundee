import React, { Component, useState } from "react";
import _ from "lodash";
import clsx from "clsx";
import moment from "moment";
import { getPeople } from "../../crud/people.crud";
import SubHeader from "../../partials/layout/SubHeader";
import KTContent from "../../../_metronic/layout/KtContent";
import {
  ProfileCard,
  ProfileCardSkeleton
} from "../../widgets/general/ProfileCard";

const Filter = ({ onSubmit, onClear }) => {
  const [date, setDate] = useState("");
  const handleDateChange = e => {
    setDate(e.target.value);
  };

  const [existsId, setExistsId] = useState("");
  const handleExistsIdChange = e => {
    setExistsId(e.target.value);
  };

  const handleSubmit = e => {
    e.preventDefault();

    const values = {};
    if (date) {
      values.date = date;
    }

    if (existsId) {
      values.existsId = existsId;
    }

    onSubmit(values);
  };

  const handleClear = () => {
    setDate("");
    setExistsId("");
    onClear();
  };

  return (
    <div
      className="dropdown dropdown-inline"
      data-toggle="kt-tooltip"
      title=""
      data-placement="left"
      data-original-title="Quick actions"
    >
      <button
        type="button"
        className="btn kt-subheader__btn-primary btn-icon kt-margin-l-5"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <i className="fa fa-filter"></i>
      </button>
      <div className="dropdown-menu" style={{ width: 220 }}>
        <form className="px-4 py-1" onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label>วันที่สร้าง</label>
            <select
              className="form-control"
              defaultValue={date}
              onChange={handleDateChange}
            >
              <option value="">ทั้งหมด</option>
              <option value={moment().format("YYYY-MM-DD")}>วันนี้</option>
              <option
                value={moment()
                  .subtract(7, "day")
                  .format("YYYY-MM-DD")}
              >
                7 วันท้าย
              </option>
              <option
                value={moment()
                  .subtract(30, "day")
                  .format("YYYY-MM-DD")}
              >
                30 วันท้าย
              </option>
              <option
                value={moment()
                  .startOf("week")
                  .format("YYYY-MM-DD")}
              >
                สัปดาห์นี้
              </option>
              <option
                value={moment()
                  .startOf("month")
                  .format("YYYY-MM-DD")}
              >
                เดือนนี
              </option>
              <option
                value={moment()
                  .startOf("year")
                  .format("YYYY-MM-DD")}
              >
                ปีนี้
              </option>
            </select>
          </div>
          <div className="form-group mb-3">
            <label>ที่อยู่</label>
            <select className="form-control">
              <option>ทั้งหมด</option>
            </select>
          </div>
          <div className="form-group mb-3">
            <label>รหัสทางการแพทย์</label>
            <select
              className="form-control"
              defaultValue={existsId}
              onChange={handleExistsIdChange}
            >
              <option>ทั้งหมด</option>
              <option value="1">มี</option>
              <option value="2">ไม่มี</option>
            </select>
          </div>
          <div className="float-right">
            <button
              type="button"
              onClick={handleClear}
              className="btn btn-secondary"
            >
              ล้าง
            </button>
            <button type="submit" className="btn btn-brand">
              ตกลง
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default class PeopleListPage extends Component {
  state = {
    isLoading: true,
    isLoadingMore: false,
    count: 0,
    offset: 1,
    limit: 40,
    items: [],
    search: "",
    filters: {
      text: ""
    }
  };

  componentDidMount() {
    this.fetchItems({ count: 1 });
  }

  fetchItems = async query => {
    try {
      // turn on spinner
      const timeout = setTimeout(() => {
        this.setState(prevState => {
          if (!prevState.isLoading) {
            return { isLoading: true };
          }
        });
      }, 1000);

      const { limit } = this.state;
      const response = await getPeople({
        sort: "-createdAt",
        limit,
        ...query
      });
      const json = response.data;
      this.setState(prevState => {
        const state = {
          items: json.results
        };

        if (prevState.offset !== 1) {
          state.items = [...prevState.items, ...state.items];
        }

        if (typeof json.count !== "undefined") {
          state.count = json.count;
        }

        return state;
      });

      clearTimeout(timeout);
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

  filterItems = () => {
    let _where = {};
    const { text, date, existsId } = this.state.filters;
    if (text) {
      _where = {
        $or: [
          {
            firstName: {
              $regex: `.*${text}.*`,
              $options: "i"
            }
          },
          {
            lastName: {
              $regex: `.*${text}.*`,
              $options: "i"
            }
          },
          {
            dentalId: {
              $regex: `.*${text}.*`,
              $options: "i"
            }
          },
          {
            childName: {
              $regex: `.*${text}.*`,
              $options: "i"
            }
          }
        ]
      };
    }

    if (date) {
      _where.createdAt = {
        $gte: moment(date).toDate()
      };
    }

    if (existsId) {
      if (existsId === "1") {
        _where.dentalId = { $regex: "^[0-9]{6}$" };
      } else {
        _where.dentalId = {
          $regex: "^(?![0-9]{6}$)"
        };
      }
    }

    this.setState({ offset: 1 }, () => {
      this.fetchItems({
        count: 1,
        where: JSON.stringify(_where)
      });
    });
  };

  handleLoadMoreClick = () => {
    const { offset, limit } = this.state;
    const skip = offset * limit;
    const offsetIncrement = offset + 1;

    this.setState(
      {
        offset: offsetIncrement,
        isLoadingMore: true
      },
      () => {
        this.fetchItems({ skip }).finally(() => {
          this.setState({ isLoadingMore: false });
        });
      }
    );
  };

  handleSearchSubmit = value => {
    const { filters } = this.state;
    const newFilters = Object.assign({}, filters, { text: value });
    if (_.isEqual(filters, newFilters)) {
      return;
    }

    this.setState(
      {
        offset: 1,
        filters: newFilters
      },
      () => {
        this.filterItems();
      }
    );
  };

  handleFilterSubmit = values => {
    const { filters } = this.state;
    const newFilters = Object.assign({}, _.pick(filters, ["text"]), values);
    if (_.isEqual(filters, newFilters)) {
      return;
    }

    this.setState(
      {
        offset: 1,
        filters: newFilters
      },
      () => {
        this.filterItems();
      }
    );
  };

  handleFilterClear = () => {
    const { filters } = this.state;
    const newFilters = _.pick(filters, ["text"]);
    if (_.isEqual(filters, newFilters)) {
      return;
    }

    this.setState(
      {
        offset: 1,
        filters: newFilters
      },
      () => {
        this.filterItems();
      }
    );
  };

  renderListItems = () => {
    const {
      items,
      isLoading,
      isLoadingMore,
      offset,
      limit,
      count
    } = this.state;

    // render skeletron items
    if (isLoading && !isLoadingMore) {
      return _.chunk(Array.from(Array(8).keys()), 4).map((cols, i) => (
        <div className="row" key={(i + 1).toString()}>
          {cols.map(col => (
            <div className="col-xl-3" key={(col + 1).toString()}>
              <ProfileCardSkeleton />
            </div>
          ))}
        </div>
      ));
    }

    const rows = _.chunk(items, 4);
    return (
      <>
        {rows.map((cols, i) => (
          <div className="row" key={(i + 1).toString()}>
            {cols.map(col => (
              <div className="col-xl-3" key={col._id}>
                <ProfileCard data={col} />
              </div>
            ))}
          </div>
        ))}

        {count > limit && offset * limit < count && (
          <div className="text-center">
            <button
              type="button"
              className={clsx("btn btn-light btn-wide btn-pill btn-font-lg", {
                "kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--brand": isLoading
              })}
              onClick={this.handleLoadMoreClick}
              disabled={isLoading}
            >
              โหลดข้อมูลเพิ่มเติม
            </button>
          </div>
        )}
      </>
    );
  };

  render() {
    const { count, isLoading } = this.state;
    return (
      <>
        <SubHeader>
          <SubHeader.Main>
            <SubHeader.Group>
              {!isLoading && <SubHeader.Desc>{count} Total</SubHeader.Desc>}
              <SubHeader.Search onSubmit={this.handleSearchSubmit} />
              <Filter
                onSubmit={this.handleFilterSubmit}
                onClear={this.handleFilterClear}
              />
            </SubHeader.Group>
          </SubHeader.Main>
        </SubHeader>
        <KTContent>{this.renderListItems()}</KTContent>
      </>
    );
  }
}
