import React, { Component, createRef } from "react";
import { connect } from "react-redux";
import {
  Portlet,
  PortletBody,
  PortletHeader
} from "../../partials/content/Portlet";
import clsx from "clsx";
import _ from "lodash";
import { CircularProgress } from "@material-ui/core";
import { metronic } from "../../../_metronic";
import SubHeader from "../../partials/layout/SubHeader";
import KTContent from "../../../_metronic/layout/KtContent";
import { getInfoDashboard } from "../../crud/dashboard.crud";

import QuickStatsChart from "../../widgets/QuickStatsChart";
import PeoplesStatisticsChart from "../../widgets/PeoplesStatisticsChart";
import PeoplesDatatable from "../../widgets/PeoplesDatatable";
import NewPeoples from "../../widgets/NewPeoples";
import ConvScheduleComplete from "../../widgets/ConvScheduleComplete";

class Dashboard extends Component {
  state = {
    period: "day",
    isLoading: true,
    isProgress: false,
    isChangeDate: false,
    widgets: []
  };

  datapickRef = createRef();

  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;

    this.fetchData({ period: this.props.period });
  }

  componentDidUpdate(/* prevProps, prevState */) {
    if (this.state.isLoading && !this.state.isProgress) {
      this.setState({ isLoading: false });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  fetchData = async params => {
    try {
      this.setState({ isProgress: true });

      const response = await getInfoDashboard(params);

      if (this._isMounted) {
        this.setState({ widgets: response.data.widgets, isProgress: false });
      }
    } catch (error) {
      // TODO handle error fetch data
      this.setState({ isProgress: false });
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

  _valueSummary(o) {
    let text = "";
    if (Object.hasOwnProperty.call(o, "name") && o.name) {
      text += `${o.name} `;
    }

    if (Object.hasOwnProperty.call(o, "value") && o.value) {
      text += `${o.value} คน`;
    }

    return text;
  }

  renderWidgets = () => {
    const { widgets, isProgress } = this.state;
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

    const widg1 = {
      value: _.result(widget1, "value", 0)
    };

    const widg2 = {
      value: _.result(widget2, "value", 0)
    };

    const widg3 = {
      value: _.result(widget3, "value", 0),
      percentage: _.result(widget3, "percentage", 0)
    };

    const widg4 = {
      value: _.result(widget4, "value", 0),
      percentage: _.result(widget4, "percentage", 0)
    };

    const widg5 = {
      labels: _.result(widget5, "labels", []),
      data: _.result(widget5, "data", [])
    };

    const widg6 = {
      total: _.result(widget6, "total", 0),
      maxPeoples: {
        name: _.result(widget6, "maxPeoples.name"),
        value: _.result(widget6, "maxPeoples.value")
      },
      maxPeoplesWithDId: {
        name: _.result(widget6, "maxPeoplesWithDId.name"),
        value: _.result(widget6, "maxPeoplesWithDId.value")
      },
      maxPeoplesGeneral: {
        name: _.result(widget6, "maxPeoplesGeneral.name"),
        value: _.result(widget6, "maxPeoplesGeneral.value")
      },
      data: _.result(widget6, "data", [])
    };

    const widg7 = {
      total: _.result(widget7, "total", 0),
      maxPeoples: {
        name: _.result(widget7, "maxPeoples.name"),
        value: _.result(widget7, "maxPeoples.value")
      },
      maxPeoplesWithDId: {
        name: _.result(widget7, "maxPeoplesWithDId.name"),
        value: _.result(widget7, "maxPeoplesWithDId.value")
      },
      maxPeoplesGeneral: {
        name: _.result(widget7, "maxPeoplesGeneral.name"),
        value: _.result(widget7, "maxPeoplesGeneral.value")
      },
      data: _.result(widget7, "data", [])
    };

    const widg8 = {
      max: _.result(widget8, "max", 0),
      min: _.result(widget8, "min", 0),
      labels: _.result(widget8, "labels", []),
      data: _.result(widget8, "data", [])
    };

    const widg9 = {
      data: _.result(widget9, "data", [])
    };

    return (
      <>
        <div className="row">
          <div className="col-xl-6">
            <div className="row row-full-height">
              <div className="col-sm-12 col-md-12 col-lg-6">
                <Portlet className="kt-portlet--height-fluid-half kt-portlet--border-bottom-brand">
                  <PortletBody fluid={true}>
                    <QuickStatsChart
                      value={widg1.value}
                      title="ผู้ใช้งานทั้งหมด"
                      desc="Total Peoples"
                    />
                  </PortletBody>
                </Portlet>

                <div className="kt-space-20" />

                <Portlet className="kt-portlet--height-fluid-half kt-portlet--border-bottom-brand">
                  <PortletBody fluid={true}>
                    <QuickStatsChart
                      value={widg2.value}
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
                      value={widg3.value}
                      title="ผู้ใช้งานที่มี ID"
                      desc="Peoples With ID"
                      percentage={widg3.percentage}
                    />
                  </PortletBody>
                </Portlet>

                <div className="kt-space-20" />

                <Portlet className="kt-portlet--height-fluid-half kt-portlet--border-bottom-brand">
                  <PortletBody fluid={true}>
                    <QuickStatsChart
                      value={widg4.value}
                      title="ผู้ใช้งานทั่วไป"
                      desc="General Peoples"
                      percentage={widg4.percentage}
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
                  labels={widg5.labels}
                  data={widg5.data}
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
                      value: `${widg6.total} จังหวัด`
                    },
                    {
                      desc: "ผู้ใช้งานเยอะที่สุด",
                      value: this._valueSummary(widg6.maxPeoples)
                    },
                    {
                      desc: "มีผู้ใช้งานที่มี ID เยอะที่สุด",
                      value: this._valueSummary(widg6.maxPeoplesWithDId)
                    },
                    {
                      desc: "มีผู้ใช้งานทั่วไปเยอะที่สุด",
                      value: this._valueSummary(widg6.maxPeoplesGeneral)
                    }
                  ]}
                  datatable={{
                    data: widg6.data,
                    sortable: Boolean(widg6.data.length > 0),
                    pagination: {
                      pageSize: 5,
                      display: Boolean(widg6.data.length > 0),
                      showTotal: true,
                      showSizePerPage: false
                    },
                    columns: [
                      {
                        Header: "จังหวัด",
                        accessor: "province",
                        width: 100,
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
                        width: 60,
                        sortable: true
                      },
                      {
                        Header: "ร้อยละ",
                        accessor: "percentage",
                        template: cell => {
                          return (
                            <div
                              className="row"
                              style={{ width: cell.column.width }}
                            >
                              <div className="col">
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
                              <div className="col" style={{ paddingLeft: 0 }}>
                                {cell.value}%
                              </div>
                            </div>
                          );
                        }
                      }
                    ],
                    loading: isProgress
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
                      value: `${widg7.total} อำเภอ`
                    },
                    {
                      desc: "ผู้ใช้งานเยอะที่สุด",
                      value: this._valueSummary(widg7.maxPeoples)
                    },
                    {
                      desc: "มีผู้ใช้งานที่มี ID เยอะที่สุด",
                      value: this._valueSummary(widg7.maxPeoplesWithDId)
                    },
                    {
                      desc: "มีผู้ใช้งานทั่วไปเยอะที่สุด",
                      value: this._valueSummary(widg7.maxPeoplesGeneral)
                    }
                  ]}
                  datatable={{
                    data: widg7.data,
                    sortable: Boolean(widg7.data.length > 0),
                    pagination: {
                      pageSize: 5,
                      display: Boolean(widg7.data.length > 0),
                      showTotal: true,
                      showSizePerPage: false
                    },
                    columns: [
                      {
                        Header: "อำเภอ",
                        accessor: "district",
                        width: 100,
                        sortable: true
                      },
                      {
                        Header: "จังหวัด",
                        accessor: "province",
                        width: 80,
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
                        template: cell => {
                          return (
                            <div
                              className="row"
                              style={{ width: cell.column.width }}
                            >
                              <div className="col">
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
                              <div className="col" style={{ paddingLeft: 0 }}>
                                {cell.value}%
                              </div>
                            </div>
                          );
                        }
                      }
                    ],
                    loading: isProgress
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
                  max={widg8.max}
                  min={widg8.min}
                  labels={widg8.labels.map((_, i) => `วันที่ ${i + 1}`)}
                  data={widg8.data}
                />
              </PortletBody>
            </Portlet>
          </div>
          <div className="col-xl-3">
            <Portlet fluidHeight={true}>
              <PortletHeader title="ผู้ใช้งานใหม่" />

              <PortletBody>
                <NewPeoples data={widg9.data} />
              </PortletBody>
            </Portlet>
          </div>
        </div>
      </>
    );
  };

  render() {
    const { isLoading, period } = this.state;

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
          {isLoading ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{
                width: "100%",
                height: "100%"
              }}
            >
              <CircularProgress className="kt-splash-screen__spinner" />
            </div>
          ) : (
            this.renderWidgets()
          )}
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
