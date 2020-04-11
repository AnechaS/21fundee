import React from "react";
import { Route, Switch } from "react-router-dom";
import Schedule from "./Schedule";
import Question from "./Question";
import People from "./People";
import Quiz from "./Quiz";
import Conversation from "./Conversation";

export default function DatabasePage() {
  return (
    <Switch>
      <Route path="/database/schedule" component={Schedule} />
      <Route path="/database/question" component={Question} />
      <Route path="/database/people" component={People} />
      <Route path="/database/quiz" component={Quiz} />
      <Route path="/database/conversation" component={Conversation} />
    </Switch>
  );
}
