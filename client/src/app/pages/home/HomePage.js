import React, { Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { LayoutSplashScreen } from "../../../_metronic";

import Dashboard from "./Dashboard";
import SchedulePage from "../database/SchedulePage";
import QuestionPage from "../database/QuestionPage";
import PeoplePage from "../database/PeoplePage";
import QuizPage from "../database/QuizPage";
import ConversationPage from "../database/ConversationPage";

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
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/database/schedule" component={SchedulePage} />
        <Route path="/database/question" component={QuestionPage} />
        <Route path="/database/people" component={PeoplePage} />
        <Route path="/database/quiz" component={QuizPage} />
        <Route path="/database/conversation" component={ConversationPage} />
        <Redirect to="/error/error-v1" />
      </Switch>
    </Suspense>
  );
}
