import React from "react";

export default function QuickStatsChart({
  value,
  title,
  percentage = 0,
  desc
}) {
  return (
    <div className="kt-widget35">
      <div className="kt-widget35__content">
        <span className="kt-widget35__title">{title}</span>
        <span className="kt-widget35__number">{value}</span>
        {Boolean(percentage) && (
          <span className="kt-widget35__percentage">
            ร้อยละ{" "}
            <span style={{ fontWeight: 500, fontSize: "1.3rem" }}>
              {percentage}
            </span>
          </span>
        )}
        <span className="kt-widget35__desc">{desc}</span>
      </div>
    </div>
  );
}
