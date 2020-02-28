import axios from "axios";

export const LOGIN_URL = "/auth/login";
export const LOGOUT_URL = "/auth/logout";
export const REGISTER_URL = "/auth/register";
export const REQUEST_PASSWORD_URL = "api/auth/forgot-password";

export const ME_URL = "/users/me";

export function login(email, password) {
  return axios.post(LOGIN_URL, { email, password });
}

export function logout() {
  return axios.post(LOGOUT_URL);
}

export function register(email, fullname, username, password) {
  return axios.post(REGISTER_URL, { email, fullname, username, password });
}

export function requestPassword(email) {
  return axios.post(REQUEST_PASSWORD_URL, { email });
}

export function getUserByToken() {
  return axios.get(ME_URL);
}
