import React from "react";

const $ = window.$;

export default class Daterangepicker extends React.Component {
  componentDidMount() {
    const { options, cb } = this.props;
    this.$el = $(this.el);
    this.$el.daterangepicker(options, cb);
  }

  render() {
    const { children } = this.props;

    return React.cloneElement(children, {
      ref: el => {
        this.el = el;
      }
    });
  }
}
