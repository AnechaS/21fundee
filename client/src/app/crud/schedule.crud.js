import axios from "axios";

export const SCHEDULE_URL = "/schedules";

export function getSchedule(query = {}) {
  return axios.get(SCHEDULE_URL, query);
}

export function getScheduleById(id) {
  return axios.get(`${SCHEDULE_URL}/${id}`);
}

export function createSchedule(object = {}) {
  return axios.post(SCHEDULE_URL, object);
}

export function updateSchedule(id, object = {}) {
  return axios.put(`${SCHEDULE_URL}/${id}`, object);
}

export function deleteSchedule(id) {
  return axios.delete(`${SCHEDULE_URL}/${id}`);
}
