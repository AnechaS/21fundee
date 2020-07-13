import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import Comment from "./Comment";
import People from "./People";
import Progress from "./Progress";
import Question from "./Question";
import Quiz from "./Quiz";
import Reply from "./Reply";
import Schedule from "./Schedule";

export default function DatabasePage() {
  return (
    <Switch>
      <Redirect from="/database" exact={true} to="/database/comment" />
      <Route path="/database/comment" component={Comment} />
      <Route path="/database/people" component={People} />
      <Route path="/database/progress" component={Progress} />
      <Route path="/database/question" component={Question} />
      <Route path="/database/quiz" component={Quiz} />
      <Route path="/database/reply" component={Reply} />
      <Route path="/database/schedule" component={Schedule} />
    </Switch>
  );
}
