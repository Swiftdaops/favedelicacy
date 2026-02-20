import api from "./api";

export async function submitContact(body, options = {}) {
  return api.post("/contact", body, options);
}
