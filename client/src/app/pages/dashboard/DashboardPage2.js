import React, { Component } from "react";
import { connect } from "react-redux";
import moment from "moment";
import { metronic } from "../../../_metronic";
import PeopleScoreCard from "../../widgets/PeopleScoreCard";
import ScheduleCompletedChart from "../../widgets/ScheduleCompletedChart";
import NewPeoples from "../../widgets/NewPeoples";
import ProvinceDatatable2 from "../../widgets/ProvinceDatatable2";
import DistrictDatatable2 from "../../widgets/DistrictDatatable2";
import PeoplesStatisticsChart from "../../widgets/PeopleStatisticsChart";

class DashboardPage2 extends Component {
  render() {
    return (
      <>
        <div className="row">
          <div className="col-xl-3">
            <PeopleScoreCard title="ผู้ใช้งานทั้งหมด" desc="Total Peoples" />
            <div className="kt-space-20" />
            <PeopleScoreCard
              title="ผู้ใช้งานรายใหม่"
              desc="New Peoples"
              query={{
                createdAt: {
                  $gte: moment()
                    .startOf("day")
                    .toDate(),
                  $lte: moment()
                    .endOf("day")
                    .toDate()
                }
              }}
            />
          </div>

          <div className="col-xl-9">
            <PeoplesStatisticsChart height={312} />
          </div>
        </div>

        <div className="row">
          <div className="col-xl-3">
            <NewPeoples />
          </div>
          <div className="col-xl-4">
            <ProvinceDatatable2 />
          </div>
          <div className="col-xl-5">
            <DistrictDatatable2 />
          </div>
        </div>

        <div className="row">
          <div className="col-xl-12">
            <ScheduleCompletedChart height={250} />
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

export default connect(mapStateToProps)(DashboardPage2);
