import React, { Component, useMemo, useCallback, useState } from "react";
import { connect } from "react-redux";
import objectPath from "object-path";
import moment from "moment";
import { withRouter } from "react-router-dom";
import clsx from "clsx";
import { LayoutContextConsumer } from "../../../_metronic/layout/LayoutContext";
import * as builder from "../../../_metronic/ducks/builder";
import { ReactComponent as SearchIcon } from "../../../_metronic/layout/assets/layout-svg-icons/Search.svg";
import Daterangepicker from "./Daterangepicker";
import KTUtil from "../../../_metronic/_assets/js/util";

const Main = ({ children, subheaderMobileToggle }) => (
  <div className="kt-subheader__main">
    {subheaderMobileToggle && (
      <button
        className="kt-subheader__mobile-toggle kt-subheader__mobile-toggle--left"
        id="kt_subheader_mobile_toggle"
      >
        <span />
      </button>
    )}

    <LayoutContextConsumer>
      {({ subheader: { title } }) => (
        <>
          <h3 className="kt-subheader__title">{title}</h3>
        </>
      )}
    </LayoutContextConsumer>

    <span className="kt-subheader__separator kt-subheader__separator--v" />
    {children}
  </div>
);

const MainContainer = connect(store => ({
  subheaderMobileToggle: objectPath.get(
    store.builder.layoutConfig,
    "subheader.mobile-toggle"
  )
}))(Main);

const Group = ({ children }) => (
  <div className="kt-subheader__group">{children}</div>
);

const Toolbar = ({ children }) => (
  <div className="kt-subheader__toolbar">
    <div className="kt-subheader__wrapper">{children}</div>
  </div>
);

const Desc = ({ children }) => (
  <span className="kt-subheader__desc">{children}</span>
);

const Button = ({
  children,
  onClick,
  color = "primary",
  disabled = false,
  className,
  ...rest
}) => (
  <button
    type="button"
    className={clsx(`btn kt-subheader__btn-${color}`, { disabled }, className)}
    onClick={onClick}
    disabled={disabled}
    {...rest}
  >
    {children}
  </button>
);

const Search = () => (
  <form className="kt-margin-l-20" id="kt_subheader_search_form">
    <div className="kt-input-icon kt-input-icon--right kt-subheader__search">
      <input
        type="text"
        className="form-control"
        placeholder="Search..."
        id="generalSearch"
      />
      <span className="kt-input-icon__icon kt-input-icon__icon--right">
        <span>
          <SearchIcon className="kt-svg-icon" />
        </span>
      </span>
    </div>
  </form>
);

const Dropdown = ({ children, ...rest }) => {
  return (
    <div
      className="dropdown dropdown-inline"
      data-toggle="kt-tooltip"
      data-placement="left"
      {...rest}
    >
      {children}
    </div>
  );
};

Dropdown.Toggle = ({ children, color = "primary" }) => (
  <button
    className={`btn kt-subheader__btn-${color}`}
    data-toggle="dropdown"
    aria-haspopup="true"
    aria-expanded="false"
  >
    {children}
  </button>
);

Dropdown.Menu = ({ children, style }) => (
  <div
    className="dropdown-menu dropdown-menu-fit dropdown-menu-md dropdown-menu-right"
    style={style}
  >
    <ul className="kt-nav">{children}</ul>
  </div>
);

Dropdown.Item = ({ children, onClick, disabled = false, ...rest }) => (
  <li className="kt-nav__item">
    <button
      type="button"
      className={clsx("kt-nav__link kt-nav__link-button", { disabled })}
      onClick={onClick}
      {...rest}
    >
      <span className="kt-nav__link-text">{children}</span>
    </button>
  </li>
);

Dropdown.Divider = () => <li className="kt-nav__separator"></li>;

const Datepicker = ({ onChange }) => {
  const startDate = useMemo(() => moment(), []);
  const endDate = useMemo(() => moment(), []);

  const [title, setTitle] = useState("Today:");
  const [range, setRange] = useState(startDate.format("MMM D"));

  const options = useMemo(
    () => ({
      direction: KTUtil.isRTL(),
      startDate: startDate,
      endDate: endDate,
      opens: "left",
      ranges: {
        Today: [moment(), moment()],
        Yesterday: [moment().subtract(1, "days"), moment().subtract(1, "days")],
        "Last 7 Days": [moment().subtract(6, "days"), moment()],
        "Last 30 Days": [moment().subtract(29, "days"), moment()],
        "This Month": [moment().startOf("month"), moment().endOf("month")],
        "Last Month": [
          moment()
            .subtract(1, "month")
            .startOf("month"),
          moment()
            .subtract(1, "month")
            .endOf("month")
        ]
      }
    }),
    [startDate, endDate]
  );

  const cb = useCallback(
    (start, end, label = "") => {
      if (end - start < 100 || label === "Today") {
        setTitle("Today:");
        setRange(start.format("MMM D"));
      } else if (label === "Yesterday") {
        setTitle("Yesterday:");
        setRange(start.format("MMM D"));
      } else {
        setRange(start.format("MMM D") + " - " + end.format("MMM D"));
      }

      onChange({ start, end });
    },
    [onChange]
  );

  return (
    <Daterangepicker options={options} cb={cb}>
      <button
        className="btn kt-subheader__btn-daterange"
        title="Select dashboard daterange"
        data-toggle="kt-tooltip"
        data-placement="left"
      >
        <span className="kt-subheader__btn-daterange-title">{title}</span>
        &nbsp;
        <span className="kt-subheader__btn-daterange-date">{range}</span>
        <i className="flaticon2-calendar-1"></i>
      </button>
    </Daterangepicker>
  );
};

class SubHeader extends Component {
  static Main = MainContainer;
  static Group = Group;
  static Toolbar = Toolbar;
  static Desc = Desc;
  static Button = Button;
  static Dropdown = Dropdown;
  static Search = Search;
  static Daterangepicker = Datepicker;

  render() {
    const {
      subheaderCssClasses,
      subheaderContainerCssClasses,
      children
    } = this.props;
    return (
      <div
        id="kt_subheader"
        className={`kt-subheader ${subheaderCssClasses} kt-grid__item`}
      >
        <div className={`kt-container ${subheaderContainerCssClasses}`}>
          {children}
        </div>
      </div>
    );
  }
}

const mapStateToProps = store => ({
  config: store.builder.layoutConfig,
  menuConfig: store.builder.menuConfig,
  subheaderCssClasses: builder.selectors.getClasses(store, {
    path: "subheader",
    toString: true
  }),
  subheaderContainerCssClasses: builder.selectors.getClasses(store, {
    path: "subheader_container",
    toString: true
  })
});

export default withRouter(connect(mapStateToProps)(SubHeader));
