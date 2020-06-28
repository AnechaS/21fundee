import React, { Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { LayoutSplashScreen } from "../../../_metronic";

import DashboardPage from "../dashboard/DashboardPage";
import DatabasePage from "../database/DatabasePage";
import PeoplePage from "../people/PeoplePage";

export default function HomePage() {
  // useEffect(() => {
  //   console.log('Home page');
  // }, []) // [] - is required if you need only one call
  // https://reactjs.org/docs/hooks-reference.html#useeffect

  return (
    <Suspense fallback={<LayoutSplashScreen />}>
      <Switch>
        {
          /* Redirect from root URL to /dashboard. */
          <Redirect exact from="/" to="/dashboard" />
        }
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/people" component={PeoplePage} />
        <Route path="/database" component={DatabasePage} />
        <Redirect to="/error/error-v1" />
      </Switch>
    </Suspense>
  );
}
