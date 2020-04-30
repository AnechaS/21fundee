import axios from "axios";

export const DASHBOARD_URL = "/dashboards";

export function getInfoDashboard(params) {
  return axios.get(DASHBOARD_URL, { params });
}
