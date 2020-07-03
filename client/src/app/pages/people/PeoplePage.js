import React from "react";
import { Route, Switch } from "react-router-dom";
import PeopleListPage from "./PeopleListPage";
import PeopleDetailPage from "./PeopleDetailPage";

export default function PeoplePage() {
  return (
    <Switch>
      <Route path="/" component={PeopleListPage} />
      <Route path="/:id" component={PeopleDetailPage} />
    </Switch>
  );
}
