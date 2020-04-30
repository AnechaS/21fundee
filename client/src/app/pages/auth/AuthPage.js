import React from "react";
import { Link, Redirect, Route, Switch } from "react-router-dom";
import Registration from "./Registration";
import ForgotPassword from "./ForgotPassword";
import Login from "./Login";
import { toAbsoluteUrl } from "../../../_metronic";
import Logo from "../../../_metronic/layout/brand/Logo";
import "../../../_metronic/_assets/sass/pages/login/login-3.scss";

export default function AuthPage() {
  return (
    <>
      <div className="kt-grid kt-grid--ver kt-grid--root kt-page">
        <div
          id="kt_login"
          className="kt-grid kt-grid--hor kt-grid--root kt-login kt-login--v3 kt-login--signin"
        >
          <div
            className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor"
            style={{
              backgroundImage: `url(${toAbsoluteUrl("/media/bg/bg-3.jpg")}`
            }}
          >
            <div className="kt-grid__item kt-grid__item--fluid kt-login__wrapper">
              <div className="kt-login__container">
                <div className="kt-login__logo">
                  <Link to="/">
                    {/* <Logo color="black" size={28} /> */}
                    <img
                      className="kt-login__logo--media kt-media kt-media--circle"
                      src={toAbsoluteUrl("/media/logos/logo-1x.jpg")}
                    ></img>
                  </Link>
                </div>

                <Switch>
                  <Redirect from="/auth" exact={true} to="/auth/login" />

                  <Route path="/auth/login" component={Login} />
                  <Route path="/auth/registration" component={Registration} />
                  <Route
                    path="/auth/forgot-password"
                    component={ForgotPassword}
                  />
                </Switch>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
