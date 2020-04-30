import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import Table from "../partials/content/Table";

export default function OrderStatisticsTable({ summarys, datatable }) {
  return (
    <div className="kt-widget34">
      {!_.isEmpty(summarys) && (
        <div className="kt-widget34__content kt-portlet__space-x kt-portlet__space-y">
          <div className="kt-widget34__item">
            {summarys[0] && (
              <div className="kt-widget34__info">
                <span className="kt-widget34__desc">{summarys[0].desc}</span>
                <span className="kt-widget34__value">{summarys[0].value}</span>
              </div>
            )}
            {summarys[1] && (
              <div className="kt-widget34__info">
                <span className="kt-widget34__desc">{summarys[1].desc}</span>
                <span className="kt-widget34__value">{summarys[1].value}</span>
              </div>
            )}
          </div>
          {summarys[2] && (
            <div className="kt-widget34__item">
              <div className="kt-widget34__info">
                <span className="kt-widget34__desc">{summarys[2].desc}</span>
                <span className="kt-widget34__value">{summarys[2].value}</span>
              </div>
              {summarys[3] && (
                <div className="kt-widget34__info">
                  <span className="kt-widget34__desc">{summarys[3].desc}</span>
                  <span className="kt-widget34__value">
                    {summarys[3].value}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <div className="kt-widget34__table" style={{ height: "350px" }}>
        <Table
          {...{
            ...datatable,
            layout: {
              ...datatable.layout,
              scroll: true,
              height: 260
            }
          }}
        />
      </div>
    </div>
  );
}

OrderStatisticsTable.defaultProps = {
  summarys: [],
  datatable: {}
};

OrderStatisticsTable.propTypes = {
  summarys: PropTypes.arrayOf(PropTypes.object),
  datatable: PropTypes.object
};
