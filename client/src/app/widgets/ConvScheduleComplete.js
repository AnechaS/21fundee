import React, { useEffect, useMemo, useRef } from "react";
import { Chart } from "chart.js";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import sum from "lodash/sum";
import { metronic } from "../../_metronic";

export default function ConvScheduleComplete({ labels, data }) {
  const ref = useRef();
  const { brandColor, successColor, shape2Color, shape3Color } = useSelector(
    state => ({
      brandColor: metronic.builder.selectors.getConfig(
        state,
        "colors.state.brand"
      ),
      successColor: metronic.builder.selectors.getConfig(
        state,
        "colors.state.success"
      ),
      shape2Color: metronic.builder.selectors.getConfig(
        state,
        "colors.base.shape.2"
      ),
      shape3Color: metronic.builder.selectors.getConfig(
        state,
        "colors.base.shape.3"
      )
    })
  );

  const dataChart = useMemo(
    () => ({
      labels,
      datasets: [
        {
          fill: true,
          // borderWidth: 0,
          backgroundColor: successColor,
          borderColor: successColor,

          pointBackgroundColor: Chart.helpers
            .color("#000000")
            .alpha(0)
            .rgbString(),
          pointBorderColor: Chart.helpers
            .color("#000000")
            .alpha(0)
            .rgbString(),
          pointHoverBackgroundColor: brandColor,
          pointHoverBorderColor: Chart.helpers
            .color("#000000")
            .alpha(0.1)
            .rgbString(),
          categoryPercentage: 0.35,
          barPercentage: 2,
          data
        }
      ]
    }),
    [brandColor, successColor, labels, data]
  );

  useEffect(() => {
    const chart = new Chart(ref.current, {
      data: dataChart,
      type: "bar",
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: false,
        scales: {
          xAxes: [
            {
              display: true,
              scaleLabel: {
                display: false,
                labelString: "Days"
              },
              gridLines: false,
              ticks: {
                display: true,
                beginAtZero: true,
                fontColor: shape3Color,
                fontSize: 12,
                padding: 10
              }
            }
          ],
          yAxes: [
            {
              categoryPercentage: 0.35,
              barPercentage: 0.7,
              display: true,
              scaleLabel: {
                display: false,
                labelString: "Percentag"
              },
              gridLines: {
                color: shape2Color,
                drawBorder: false,
                offsetGridLines: false,
                drawTicks: false,
                borderDash: [3, 4],
                zeroLineWidth: 1,
                zeroLineColor: shape2Color,
                zeroLineBorderDash: [3, 4]
              },
              ticks: {
                max: 100,
                display: true,
                beginAtZero: true,
                fontColor: shape3Color,
                fontSize: 12,
                padding: 10
              }
            }
          ]
        },
        title: {
          display: false
        },
        hover: {
          mode: "ErrorsPage.js"
        },
        tooltips: {
          enabled: true,
          intersect: false,
          mode: "nearest",
          bodySpacing: 5,
          yPadding: 10,
          xPadding: 10,
          caretPadding: 0,
          displayColors: false,
          titleFontColor: "#ffffff",
          cornerRadius: 4,
          footerSpacing: 0,
          titleSpacing: 0,
          callbacks: {
            label: tooltipItems => {
              return tooltipItems.yLabel + "%";
            }
          }
        },
        layout: {
          padding: {
            left: 0,
            right: 0,
            top: 5,
            bottom: 5
          }
        }
      }
    });

    return () => {
      chart.destroy();
    };
  }, [dataChart, brandColor, shape2Color, shape3Color]);

  const avgPrecentComplate = useMemo(() => {
    if (!data.length) {
      return 0;
    }

    const avg = Number((sum(data) / data.length).toFixed(2));
    return avg;
  }, [data]);

  const avgPrecentNotComplate = useMemo(() => {
    if (!data.length) {
      return 0;
    }

    const values = data.map(val => 100 - val);
    const avg = Number((sum(values) / values.length).toFixed(2));
    return avg;
  }, [data]);

  return (
    <div className="kt-widget12">
      <div className="kt-widget12__content kt-portlet__space-x kt-portlet__space-y">
        <div className="kt-widget12__item" style={{ marginBottom: "0px" }}>
          <div className="kt-widget12__info">
            <span className="kt-widget12__desc">
              อัตตราที่ผู้ใช้งานคุยกับแชทบอทจนครบ 21 วัน
            </span>
            <span className="kt-widget12__value">{avgPrecentComplate}%</span>
          </div>
          <div className="kt-widget12__info">
            <span className="kt-widget12__desc">
              อัตตราที่ผู้ใช้งานคุยกับแชทบอทไม่ครบ 21 วัน
            </span>
            <span className="kt-widget12__value">{avgPrecentNotComplate}%</span>
          </div>
        </div>
      </div>
      <div className="kt-widget12__chart" style={{ height: "250px" }}>
        <canvas
          ref={ref}
          width={683}
          height={312}
          id="kt_chart_order_statistics"
        />
      </div>
    </div>
  );
}

ConvScheduleComplete.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number).isRequired,
  labels: PropTypes.arrayOf(PropTypes.string).isRequired
};
