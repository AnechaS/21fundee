import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Portlet,
  PortletBody,
  PortletHeader
} from "../../partials/content/Portlet";
import { metronic } from "../../../_metronic";
import SubHeader from "../../partials/layout/SubHeader";
import KTContent from "../../../_metronic/layout/KtContent";
import QuickStatsChart from "../../widgets/QuickStatsChart";
import OrderStatisticsChart from "../../widgets/OrderStatisticsChart-v2";
import OrderStatisticsTable from "../../widgets/OrderStatisticsTable";
import NewUsers from "../../widgets/NewUsers";
import ConvScheduleComplete from "../../widgets/ConvScheduleComplete";
import { getInfoDashboard } from "../../crud/dashboard.crud";
import clsx from "clsx";

class Dashboard extends Component {
  state = {
    period: "day",
    loading: true,
    widgets: [
      {
        value: 0
      },
      {
        value: 0
      },
      {
        value: 0,
        percentage: 0
      },
      {
        value: 0,
        percentage: 0
      },
      {
        labels: [],
        data: []
      },
      {
        totol: 0,
        maxPeoples: {
          name: "",
          value: ""
        },
        maxPeoplesWithDId: {
          name: "",
          value: ""
        },
        maxPeoplesGeneral: {
          name: "",
          value: ""
        },
        data: []
      },
      {
        totol: 0,
        maxPeoples: {
          name: "",
          value: ""
        },
        maxPeoplesWithDId: {
          name: "",
          value: ""
        },
        maxPeoplesGeneral: {
          name: "",
          value: ""
        },
        data: []
      },
      {
        max: 0,
        min: 0,
        labels: [],
        data: []
      },
      {
        data: []
      }
    ]
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async params => {
    try {
      this.setState({ loading: true });

      const response = await getInfoDashboard(params);

      this.setState({ widgets: response.data.widgets, loading: false });
    } catch (error) {
      // TODO handle error fetch data
      this.setState({ loading: false });
    }
  };

  handleChangeDate = ({ start, end }) => {
    this.fetchData({
      dateStart: start.format("YYYY-MM-DD"),
      dateEnd: end.format("YYYY-MM-DD")
    });
  };

  handleChangePeriod = value => {
    const { period } = this.state;
    if (period !== value) {
      this.setState({ period: value });

      this.fetchData({ period: value });
    }
  };

  widget6Props = () => {};

  _valSummary(o) {
    let text = "";
    if (Object.hasOwnProperty.call(o, "name") && o.name) {
      text += `${o.name} `;
    }

    if (Object.hasOwnProperty.call(o, "value") && o.value) {
      text += `${o.value} คน`;
    }

    return text;
  }

  render() {
    const { brandColor, dangerColor, successColor, primaryColor } = this.props;
    const { widgets, period, loading } = this.state;
    const [
      widget1,
      widget2,
      widget3,
      widget4,
      widget5,
      widget6,
      widget7,
      widget8,
      widget9
    ] = widgets;

    return (
      <>
        <SubHeader>
          <SubHeader.Main />
          <SubHeader.Toolbar>
            <SubHeader.Button
              color="secondary"
              className={clsx({ active: period === "day" })}
              onClick={() => this.handleChangePeriod("day")}
            >
              Today
            </SubHeader.Button>
            <SubHeader.Button
              color="secondary"
              className={clsx({ active: period === "month" })}
              onClick={() => this.handleChangePeriod("month")}
            >
              Month
            </SubHeader.Button>
            <SubHeader.Button
              color="secondary"
              className={clsx({ active: period === "year" })}
              onClick={() => this.handleChangePeriod("year")}
            >
              Year
            </SubHeader.Button>
            <SubHeader.Daterangepicker onChange={this.handleChangeDate} />
          </SubHeader.Toolbar>
        </SubHeader>
        <KTContent>
          <div className="row">
            <div className="col-xl-6">
              <div className="row row-full-height">
                <div className="col-sm-12 col-md-12 col-lg-6">
                  <Portlet className="kt-portlet--height-fluid-half kt-portlet--border-bottom-brand">
                    <PortletBody fluid={true}>
                      <QuickStatsChart
                        value={widget1.value}
                        title="ผู้ใช้งานทั้งหมด"
                        desc="Total Peoples"
                        border={brandColor}
                      />
                    </PortletBody>
                  </Portlet>
                  <div className="kt-space-20" />
                  <Portlet className="kt-portlet--height-fluid-half kt-portlet--border-bottom-brand">
                    <PortletBody fluid={true}>
                      <QuickStatsChart
                        value={widget2.value}
                        title="ผู้ใช้งานรายใหม่"
                        desc="New Peoples"
                        border={dangerColor}
                      />
                    </PortletBody>
                  </Portlet>
                </div>

                <div className="col-sm-12 col-md-12 col-lg-6">
                  <Portlet className="kt-portlet--height-fluid-half kt-portlet--border-bottom-brand">
                    <PortletBody fluid={true}>
                      <QuickStatsChart
                        value={widget3.value}
                        title="ผู้ใช้งานที่มี ID"
                        desc="Peoples With ID"
                        percentage={widget3.percentage}
                        border={successColor}
                      />
                    </PortletBody>
                  </Portlet>
                  <div className="kt-space-20" />
                  <Portlet className="kt-portlet--height-fluid-half kt-portlet--border-bottom-brand">
                    <PortletBody fluid={true}>
                      <QuickStatsChart
                        value={widget4.value}
                        title="ผู้ใช้งานทั่วไป"
                        desc="General Peoples"
                        percentage={widget4.percentage}
                        border={primaryColor}
                      />
                    </PortletBody>
                  </Portlet>
                </div>
              </div>
            </div>

            <div className="col-xl-6">
              <Portlet fluidHeight={true}>
                <PortletHeader title="สถิติผู้ใช้งาน" />

                <PortletBody>
                  <OrderStatisticsChart
                    labels={widget5.labels}
                    data={widget5.data}
                  />
                </PortletBody>
              </Portlet>
            </div>
          </div>

          <div className="row">
            <div className="col-xl-6">
              <Portlet fluidHeight={true}>
                <PortletHeader title="จังหวัด" />

                <PortletBody fit={true}>
                  <OrderStatisticsTable
                    summarys={[
                      {
                        desc: "จำนวน",
                        value: widget6.total ? `${widget6.total} จังหวัด` : ""
                      },
                      {
                        desc: "ผู้ใช้งานเยอะที่สุด",
                        value: this._valSummary(widget6.maxPeoples)
                      },
                      {
                        desc: "มีผู้ใช้งานที่มี ID เยอะที่สุด",
                        value: this._valSummary(widget6.maxPeoplesWithDId)
                      },
                      {
                        desc: "มีผู้ใช้งานทั่วไปเยอะที่สุด",
                        value: this._valSummary(widget6.maxPeoplesGeneral)
                      }
                    ]}
                    datatable={{
                      data: {
                        source: widget6.data
                      },
                      sortable: Boolean(widget6.data.length > 0),
                      pagination: Boolean(widget6.data.length > 0),
                      columns: [
                        {
                          Header: "จังหวัด",
                          accessor: "province",
                          width: 150,
                          sortable: false
                        },
                        {
                          Header: "ผู้ใข้ที่มี ID",
                          accessor: "peoplesWithDIdCount",
                          width: 60,
                          sortable: true
                        },
                        {
                          Header: "ผู้ใข้ทั่วไป",
                          accessor: "peoplesGeneralCount",
                          width: 60,
                          sortable: true
                        },
                        {
                          Header: "จำนวน",
                          accessor: "peoplesCount",
                          width: 80,
                          sortable: true
                        },
                        {
                          Header: "ร้อยละ",
                          accessor: "percentage",
                          template: ({ percentage }) => {
                            return (
                              <div className="row">
                                <div className="col-sm-6">
                                  <div
                                    className="progress"
                                    style={{ height: "15px" }}
                                  >
                                    <div
                                      className="progress-bar bg-info"
                                      role="progressbar"
                                      style={{ width: `${percentage}%` }}
                                      aria-valuenow={percentage}
                                      aria-valuemin="0"
                                      aria-valuemax="100"
                                    ></div>
                                  </div>
                                </div>
                                <div className="col-sm-6">{percentage}%</div>
                              </div>
                            );
                          }
                        }
                      ],
                      toolbar: {
                        items: {
                          info: true
                        }
                      },
                      loading
                    }}
                  />
                </PortletBody>
              </Portlet>
            </div>
            <div className="col-xl-6">
              <Portlet fluidHeight={true}>
                <PortletHeader title="อำเภอ" />

                <PortletBody fit={true}>
                  <OrderStatisticsTable
                    summarys={[
                      {
                        desc: "จำนวน",
                        value: widget6.total ? `${widget7.total} อำเภอ` : ""
                      },
                      {
                        desc: "ผู้ใช้งานเยอะที่สุด",
                        value: this._valSummary(widget7.maxPeoples)
                      },
                      {
                        desc: "มีผู้ใช้งานที่มี ID เยอะที่สุด",
                        value: this._valSummary(widget7.maxPeoplesWithDId)
                      },
                      {
                        desc: "มีผู้ใช้งานทั่วไปเยอะที่สุด",
                        value: this._valSummary(widget7.maxPeoplesGeneral)
                      }
                    ]}
                    datatable={{
                      data: {
                        source: widget7.data
                      },
                      sortable: Boolean(widget6.data.length > 0),
                      pagination: Boolean(widget6.data.length > 0),
                      columns: [
                        {
                          Header: "อำเภอ",
                          accessor: "district",
                          width: 150,
                          sortable: true
                        },
                        {
                          Header: "ผู้ใข้ที่มี ID",
                          accessor: "peoplesWithDIdCount",
                          width: 60,
                          sortable: true
                        },
                        {
                          Header: "ผู้ใข้ทั่วไป",
                          accessor: "peoplesGeneralCount",
                          width: 60,
                          sortable: true
                        },
                        {
                          Header: "จำนวน",
                          accessor: "peoplesCount",
                          width: 80,
                          sortable: true
                        },
                        {
                          Header: "ร้อยละ",
                          accessor: "percentage",
                          template: ({ percentage }, i) => {
                            return (
                              <div className="row">
                                <div className="col-sm-6">
                                  <div
                                    className="progress"
                                    style={{ height: "15px" }}
                                  >
                                    <div
                                      className="progress-bar bg-info"
                                      role="progressbar"
                                      style={{ width: `${percentage}%` }}
                                      aria-valuenow={percentage}
                                      aria-valuemin="0"
                                      aria-valuemax="100"
                                    ></div>
                                  </div>
                                </div>
                                <div className="col-sm-6">{percentage}%</div>
                              </div>
                            );
                          }
                        }
                      ],
                      toolbar: {
                        items: {
                          info: true
                        }
                      },
                      loading
                    }}
                  />
                </PortletBody>
              </Portlet>
            </div>
          </div>

          <div className="row">
            <div className="col-xl-9">
              <Portlet fluidHeight={true}>
                <PortletHeader title="ยอดความสำเร็จในการคุยกับบอท 21 วัน" />

                <PortletBody>
                  <ConvScheduleComplete
                    max={widget8.max}
                    min={widget8.min}
                    labels={widget8.labels}
                    data={widget8.data}
                  />
                </PortletBody>
              </Portlet>
            </div>
            <div className="col-xl-3">
              <Portlet fluidHeight={true}>
                <PortletHeader title="ผู้ใช้งานใหม่" />

                <PortletBody>
                  <NewUsers data={widget9.data} progress={loading} />
                </PortletBody>
              </Portlet>
            </div>
          </div>
        </KTContent>
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

export default connect(mapStateToProps)(Dashboard);
