import React from "react";
import PropTypes from "prop-types";
const colorMedials = ["success", "danger", "warning", "info"];

export default function NewPeoples({ data, progress }) {
  if (!data.length && !progress) {
    return (
      <div className="kt-widget4 kt-widget4--no-data">
        <div className="kt-widget4__text">ไม่มีข้อมูลที่จะแสดง</div>
      </div>
    );
  }

  return (
    <>
      <div className="kt-widget4">
        {data.map(({ _id, firstName, lastName, province, district }) => {
          const ranColorMedial = colorMedials[Math.floor(Math.random() * 3)];

          return (
            <div key={_id} className="kt-widget4__item">
              <div className="kt-widget4__pic kt-widget4__pic--pic">
                <div className={`kt-media kt-media--${ranColorMedial}`}>
                  <span>{firstName.substring(0, 2)}</span>
                </div>
              </div>
              <div className="kt-widget4__info ">
                <div className="kt-widget4__username">
                  {firstName} {lastName}
                </div>
                <p className="kt-widget4__text ">
                  ที่อยู่ จ. {province || "อื่่นๆ"} ต. {district || "อื่นๆ"}
                </p>
              </div>
              {/* <a className="btn btn-sm btn-label-dark">Follow</a> */}
            </div>
          );
        })}
      </div>
    </>
  );
}

NewPeoples.defaultProps = {
  data: [],
  progress: false
};

NewPeoples.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  progress: PropTypes.bool
};
