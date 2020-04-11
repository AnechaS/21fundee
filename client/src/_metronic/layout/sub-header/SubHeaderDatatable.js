import React, { Component } from "react";
import { connect } from "react-redux";
import objectPath from "object-path";
import { withRouter } from "react-router-dom";
import { LayoutContextConsumer } from "../LayoutContext";
import * as builder from "../../ducks/builder";
import { ReactComponent as SearchIcon } from "../assets/layout-svg-icons/Search.svg";
import { ReactComponent as WriteIcon } from "../assets/layout-svg-icons/Write.svg";
import { ReactComponent as FilterIcon } from "../assets/layout-svg-icons/Filter.svg";
import { ReactComponent as UpdateIcon } from "../assets/layout-svg-icons/Update.svg";
import { ReactComponent as PlusIcon } from "../assets/layout-svg-icons/Plus.svg";

class SubHeaderDatatable extends Component {
  render() {
    const {
      subheaderCssClasses,
      subheaderContainerCssClasses,
      subheaderMobileToggle,
      total,
      onClickCreate,
      onClickRefresh,
      onClickDelete,
      onClickDeleteAll
    } = this.props;
    return (
      <div
        id="kt_subheader"
        className={`kt-subheader ${subheaderCssClasses} kt-grid__item`}
      >
        <div className={`kt-container ${subheaderContainerCssClasses}`}>
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
            <div className="kt-subheader__group" id="kt_subheader_search">
              <span className="kt-subheader__desc" id="kt_subheader_total">
                {total} Total
              </span>
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
            </div>
          </div>

          <div className="kt-subheader__toolbar">
            <div className="kt-subheader__wrapper">
              <button
                type="button"
                className="btn kt-subheader__btn-secondary"
                onClick={onClickCreate}
              >
                <PlusIcon className="kt-svg-icon kt-svg-icon-sm" />
                &nbsp; Add Row
              </button>
              <button
                type="button"
                className="btn kt-subheader__btn-secondary"
                onClick={onClickRefresh}
              >
                <UpdateIcon className="kt-svg-icon kt-svg-icon-sm" />
                &nbsp; Refresh
              </button>
              <button type="button" className="btn kt-subheader__btn-secondary">
                <FilterIcon className="kt-svg-icon kt-svg-icon-sm" />
                &nbsp; Filter
              </button>
              <div
                className="dropdown dropdown-inline"
                data-toggle="kt-tooltip"
                title=""
                data-placement="left"
                data-original-title="Quick actions"
              >
                <button
                  className="btn kt-subheader__btn-secondary"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <WriteIcon className="kt-svg-icon kt-svg-icon--sm" />
                  &nbsp; Edit
                </button>

                <div
                  className="dropdown-menu dropdown-menu-fit dropdown-menu-md dropdown-menu-right"
                  style={{ width: "200px" }}
                >
                  <ul className="kt-nav">
                    <li className="kt-nav__item">
                      <button
                        type="button"
                        className="kt-nav__link kt-nav__link-button"
                        onClick={onClickCreate}
                      >
                        <span className="kt-nav__link-text">Add a row</span>
                      </button>
                    </li>
                    <li className="kt-nav__separator"></li>
                    <li className="kt-nav__item">
                      <button
                        type="button"
                        className="kt-nav__link kt-nav__link-button"
                        onClick={onClickDelete}
                      >
                        <span className="kt-nav__link-text">
                          Delete these rows
                        </span>
                      </button>
                    </li>
                    <li className="kt-nav__item">
                      <button
                        type="button"
                        onClick={onClickDeleteAll}
                        className="kt-nav__link kt-nav__link-button"
                      >
                        <span className="kt-nav__link-text">
                          Delete all rows
                        </span>
                      </button>
                    </li>
                    <li className="kt-nav__separator"></li>
                    <li className="kt-nav__item">
                      <button
                        type="button"
                        className="kt-nav__link kt-nav__link-button"
                      >
                        <span className="kt-nav__link-text">Import data</span>
                      </button>
                    </li>
                    <li className="kt-nav__item">
                      <button
                        type="button"
                        className="kt-nav__link kt-nav__link-button"
                      >
                        <span className="kt-nav__link-text">
                          Export this data
                        </span>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

SubHeaderDatatable.defaultProps = {
  total: 0
};

const mapStateToProps = store => ({
  config: store.builder.layoutConfig,
  menuConfig: store.builder.menuConfig,
  subheaderMobileToggle: objectPath.get(
    store.builder.layoutConfig,
    "subheader.mobile-toggle"
  ),
  subheaderCssClasses: builder.selectors.getClasses(store, {
    path: "subheader",
    toString: true
  }),
  subheaderContainerCssClasses: builder.selectors.getClasses(store, {
    path: "subheader_container",
    toString: true
  })
});

export default withRouter(connect(mapStateToProps)(SubHeaderDatatable));
