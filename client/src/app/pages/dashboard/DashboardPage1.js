import React, { Component } from "react";
import { connect } from "react-redux";
import moment from "moment";
import { metronic } from "../../../_metronic";
import PeopleScoreCard from "../../widgets/PeopleScoreCard";
import PeopleStatisticsChart from "../../widgets/PeopleStatisticsChart";
import ProvinceDatatable1 from "../../widgets/ProvinceDatatable1";
import DistrictDatatable1 from "../../widgets/DistrictDatatable1";
import ScheduleCompletedChart from "../../widgets/ScheduleCompletedChart";
import NewPeoples from "../../widgets/NewPeoples";

class DashboardPage1 extends Component {
  _isMounted = false;
  _startDate = moment.utc("2019-07-01");
  _endDate = moment.utc("2020-04-04");

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    return (
      <>
        <div className="row">
          <div className="col-xl-5">
            <div className="row row-full-height">
              <div className="col-sm-12 col-md-12 col-lg-6">
                <PeopleScoreCard
                  title="ผู้ใช้งานทั้งหมด"
                  desc="Total Peoples"
                  query={{
                    createdAt: {
                      $lte: this._endDate.toDate()
                    }
                  }}
                />
                <div className="kt-space-20" />
                <PeopleScoreCard
                  title="ผู้ใช้งานรายใหม่"
                  desc="New Peoples"
                  query={{
                    createdAt: {
                      $gte: this._endDate
                        .clone()
                        .startOf("month")
                        .toDate(),
                      $lte: this._endDate.toDate()
                    }
                  }}
                />
              </div>

              <div className="col-sm-12 col-md-12 col-lg-6">
                <PeopleScoreCard
                  title="ผู้ใช้งานที่มี ID"
                  desc="Peoples With ID"
                  query={{
                    createdAt: {
                      $lte: this._endDate.toDate()
                    },
                    dentalId: {
                      $regex: "^[0-9]{6}$"
                    }
                  }}
                />
                <div className="kt-space-20" />
                <PeopleScoreCard
                  title="ผู้ใช้งานทั่วไป"
                  desc="General Peoples"
                  query={{
                    createdAt: {
                      $lte: this._endDate.toDate()
                    },
                    $or: [
                      {
                        dentalId: {
                          $regex: "^(?![0-9]{6}$)"
                        }
                      },
                      {
                        dentalId: {
                          $exists: false
                        }
                      }
                    ]
                  }}
                />
              </div>
            </div>
          </div>

          <div className="col-xl-7">
            <PeopleStatisticsChart
              endDate={this._endDate.format("YYYY-MM-DD")}
              height={312}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-xl-6">
            <ProvinceDatatable1 height="571px" />
          </div>
          <div className="col-xl-6">
            <DistrictDatatable1 />
          </div>
        </div>

        <div className="row">
          <div className="col-xl-9">
            <ScheduleCompletedChart
              height={250}
              query={{
                createdAt: {
                  $lte: this._endDate.toDate()
                }
              }}
            />
          </div>
          <div className="col-xl-3">
            <NewPeoples
              query={{
                createdAt: {
                  $lte: this._endDate.toDate()
                }
              }}
            />
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = state => ({
  brandColor: metronic.builder.selectors.getConfig(state, "colors.state.brand"),
  dangerColor: metronic.builder.selectors.getConfig(
    state,
    "colors.state.danger"
  ),
  successColor: metronic.builder.selectors.getConfig(
    state,
    "colors.state.success"
  ),
  primaryColor: metronic.builder.selectors.getConfig(
    state,
    "colors.state.primary"
  )
});

export default connect(mapStateToProps)(DashboardPage1);
