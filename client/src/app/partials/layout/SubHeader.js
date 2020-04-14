import React, { Component } from "react";
import { connect } from "react-redux";
import objectPath from "object-path";
import { withRouter } from "react-router-dom";
import clsx from "clsx";
import { LayoutContextConsumer } from "../../../_metronic/layout/LayoutContext";
import * as builder from "../../../_metronic/ducks/builder";
import { ReactComponent as SearchIcon } from "../../../_metronic/layout/assets/layout-svg-icons/Search.svg";

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
  ...rest
}) => (
  <button
    type="button"
    className={clsx(`btn kt-subheader__btn-${color}`, { disabled })}
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

class Dropdown extends Component {
  static Toggle = ({ children, color = "primary" }) => (
    <button
      className={`btn kt-subheader__btn-${color}`}
      data-toggle="dropdown"
      aria-haspopup="true"
      aria-expanded="false"
    >
      {children}
    </button>
  );

  static Menu = ({ children, style }) => (
    <div
      className="dropdown-menu dropdown-menu-fit dropdown-menu-md dropdown-menu-right"
      style={style}
    >
      <ul className="kt-nav">{children}</ul>
    </div>
  );

  static Item = ({ children, onClick, disabled = false, ...rest }) => (
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

  static Divider = () => <li className="kt-nav__separator"></li>;

  render() {
    const { children, ...rest } = this.props;
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
  }
}

class SubHeader extends Component {
  static Main = MainContainer;
  static Group = Group;
  static Toolbar = Toolbar;
  static Desc = Desc;
  static Button = Button;
  static Dropdown = Dropdown;
  static Search = Search;

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
