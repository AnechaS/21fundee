import React, { Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { LayoutSplashScreen } from "../../../_metronic";

import DashboardPage from "../dashboard/DashboardPage";
import DatabasePage from "../database/DatabasePage";
import PeoplePage from "../people/PeoplePage";

export default function HomePage() {
  return (
    <Suspense fallback={<LayoutSplashScreen />}>
      <Switch>
        <Redirect exact from="/" to="/dashboard" />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/database" component={DatabasePage} />
        <Route path="/people" component={PeoplePage} />
        <Redirect to="/error" />
      </Switch>
    </Suspense>
  );
}
