import React, { useState } from "react";
import moment from "moment";
import Skeleton from "@material-ui/lab/Skeleton";

export function ProfileCard({ data, onClick }) {
  const [isImgError, setIsImgError] = useState(false);
  return (
    <div className="kt-portlet kt-portlet--height-fluid">
      <div className="kt-portlet__body">
        <div className="kt-widget kt-widget--user-profile-5">
          <div className="kt-widget__head">
            <div className="kt-widget__media">
              {!data.pic || isImgError ? (
                <div className="kt-widget__pic kt-widget__pic--brand kt-font-brand kt-font-boldest">
                  {data.firstName ? data.firstName.substring(0, 2) : ""}
                </div>
              ) : (
                <img
                  className="kt-widget__img"
                  width={90}
                  height={90}
                  src={data.pic}
                  onError={() => setIsImgError(true)}
                  alt=""
                />
              )}
            </div>
            <div className="kt-widget__info">
              <span className="kt-widget__username">
                {data.firstName} {data.lastName}
              </span>
            </div>
          </div>
          <div className="kt-widget__body">
            <div className="kt-widget__item">
              <div className="kt-widget__contact">
                <span className="kt-widget__label">ที่อยู่:</span>
                <span className="kt-widget__data">
                  อ.{data.district} จ.{data.province}
                </span>
              </div>
              <div className="kt-widget__contact">
                <span className="kt-widget__label">ลูกชื่อ:</span>
                <span className="kt-widget__data">{data.childName}</span>
              </div>
              <div className="kt-widget__contact">
                <span className="kt-widget__label">ลูกเกิดเมื่อ(พ.ศ.):</span>
                <span className="kt-widget__data">{data.childBirthday}</span>
              </div>
              <div className="kt-widget__contact">
                <span className="kt-widget__label">วันที่สร้าง:</span>
                <span className="kt-widget__data">
                  {moment(data.createdAt).format("ll")}
                </span>
              </div>
              <div className="kt-widget__contact">
                <span className="kt-widget__label">อื่นๆ:</span>
                <span className="kt-widget__data">
                  {data.gender ? `เพศ ${data.gender}` : ""}{" "}
                  {/^\d{6}$/.test(data.dentalId) ? `รหัส ${data.dentalId}` : ""}
                </span>
              </div>
            </div>
          </div>
          <div className="kt-widget__footer">
            <button
              type="button"
              className="btn btn-label-brand btn-lg"
              onClick={onClick}
            >
              ดูข้อมูล
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileCardSkeleton() {
  return (
    <div className="kt-portlet kt-portlet--height-fluid">
      <div className="kt-portlet__body">
        <div className="kt-widget kt-widget--user-profile-5">
          <div className="kt-widget__head">
            <div className="kt-widget__media">
              <Skeleton variant="circle" width={90} height={90} />
            </div>
            <div className="kt-widget__info">
              <span className="kt-widget__username">
                <Skeleton variant="text" height={25} />
              </span>
            </div>
          </div>
          <div className="kt-widget__body">
            <div className="kt-widget__item">
              <div className="kt-widget__contact">
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="40%" />
              </div>
              <div className="kt-widget__contact">
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="40%" />
              </div>
              <div className="kt-widget__contact">
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="40%" />
              </div>
              <div className="kt-widget__contact">
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="40%" />
              </div>
              <div className="kt-widget__contact">
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="40%" />
              </div>
            </div>
          </div>
          <div className="kt-widget__footer">
            <Skeleton variant="rect" height={49} />
          </div>
        </div>
      </div>
    </div>
  );
}
