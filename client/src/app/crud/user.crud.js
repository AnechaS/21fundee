import axios from "axios";

export const USER_URL = "/users";

export function updateUserByToken(object = {}) {
  return axios.put(`${USER_URL}/me`, object);
}

export function changePassword(object = {}) {
  return axios.post(`${USER_URL}/me/changePassword`, object);
}
