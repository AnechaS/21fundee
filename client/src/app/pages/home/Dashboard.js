import React, { Component, createRef } from "react";
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
import PeoplesStatisticsChart from "../../widgets/PeoplesStatisticsChart";
import PeoplesDatatable from "../../widgets/PeoplesDatatable";
import NewPeoples from "../../widgets/NewPeoples";
import ConvScheduleComplete from "../../widgets/ConvScheduleComplete";
import { getInfoDashboard } from "../../crud/dashboard.crud";
import clsx from "clsx";

class Dashboard extends Component {
  state = {
    period: "day",
    loading: true,
    isChangeDate: false,
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

  datapickRef = createRef();

  componentDidMount() {
    /* const { period } = this.props; */
    this.fetchData(/* { period } */);
  }

  fetchData = async params => {
    try {
      const { loading } = this.state;
      if (!loading) {
        this.setState({ loading: true });
      }

      const response = await getInfoDashboard(params);

      this.setState({ widgets: response.data.widgets, loading: false });
    } catch (error) {
      // TODO handle error fetch data
      this.setState({ loading: false });
    }
  };

  handleChangeDate = ({ start, end }) => {
    this.setState({ period: "day", isChangeDate: true });
    this.fetchData({
      dateStart: start.format("YYYY-MM-DD"),
      dateEnd: end.format("YYYY-MM-DD")
    });
  };

  handleChangePeriod = value => {
    const { period, isChangeDate } = this.state;
    if (period !== value || isChangeDate) {
      this.datapickRef.current.reset();

      this.setState({ period: value, isChangeDate: false });

      this.fetchData({ period: value });
    }
  };

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
              Day
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
            <SubHeader.Daterangepicker
              ref={this.datapickRef}
              onChange={this.handleChangeDate}
            />
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
                  <PeoplesStatisticsChart
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
                  <PeoplesDatatable
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
                          template: cell => {
                            return (
                              <div className="row" style={{ width: "100%" }}>
                                <div className="col-sm-6">
                                  <div
                                    className="progress"
                                    style={{ height: "15px" }}
                                  >
                                    <div
                                      className="progress-bar bg-info"
                                      role="progressbar"
                                      style={{ width: `${cell.value}%` }}
                                      aria-valuenow={cell.value}
                                      aria-valuemin="0"
                                      aria-valuemax="100"
                                    ></div>
                                  </div>
                                </div>
                                <div className="col-sm-6">{cell.value}%</div>
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
                      layout: {
                        scroll: true,
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
                  <PeoplesDatatable
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
                          sortable: true,
                          template: cell => {
                            return (
                              <>
                                <div>
                                  <div>{cell.value}</div>
                                  <small
                                    className="text-muted"
                                    style={{ fontSize: "11px" }}
                                  >
                                    จ. {cell.row.original.province}
                                  </small>
                                </div>
                              </>
                            );
                          }
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
                          template: cell => {
                            return (
                              <span style={{ width: 150 }}>
                                <div className="row">
                                  <div className="col-sm-6">
                                    <div
                                      className="progress"
                                      style={{ height: "15px" }}
                                    >
                                      <div
                                        className="progress-bar bg-info"
                                        role="progressbar"
                                        style={{ width: `${cell.value}%` }}
                                        aria-valuenow={cell.value}
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                      ></div>
                                    </div>
                                  </div>
                                  <div className="col-sm-6">{cell.value}%</div>
                                </div>
                              </span>
                            );
                          }
                        }
                      ],
                      toolbar: {
                        items: {
                          info: true
                        }
                      },
                      layout: {
                        scroll: true
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
                <PortletHeader title="สถิติการคุยกับแชทบอท 21 วัน" />

                <PortletBody>
                  <ConvScheduleComplete
                    max={widget8.max}
                    min={widget8.min}
                    labels={widget8.labels.map((_, i) => `วันที่ ${i + 1}`)}
                    data={widget8.data}
                  />
                </PortletBody>
              </Portlet>
            </div>
            <div className="col-xl-3">
              <Portlet fluidHeight={true}>
                <PortletHeader title="ผู้ใช้งานใหม่" />

                <PortletBody>
                  <NewPeoples data={widget9.data} progress={loading} />
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
