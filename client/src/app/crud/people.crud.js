import axios from "axios";

export const PEOPLE_URL = "/peoples";

export function getPeople() {
  return axios.get(PEOPLE_URL);
}

export function getPeopleById(id) {
  return axios.get(`${PEOPLE_URL}/${id}`);
}

export function createPeople(object = {}) {
  return axios.post(PEOPLE_URL, object);
}

export function updatePeople(id, object = {}) {
  return axios.put(`${PEOPLE_URL}/${id}`, object);
}

export function deletePeople(id) {
  return axios.delete(`${PEOPLE_URL}/${id}`);
}
