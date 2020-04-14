import axios from "axios";

export const CONVERSATION_URL = "/conversations";

export function getConversation() {
  return axios.get(CONVERSATION_URL);
}

export function getConversationById(id) {
  return axios.get(`${CONVERSATION_URL}/${id}`);
}

export function createConversation(object = {}) {
  return axios.post(CONVERSATION_URL, object);
}

export function updateConversation(id, object = {}) {
  return axios.put(`${CONVERSATION_URL}/${id}`, object);
}

export function deleteConversation(id) {
  return axios.delete(`${CONVERSATION_URL}/${id}`);
}
