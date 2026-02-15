const fetch = require("node-fetch");

const API_URL = process.env.API_URL || "https://campuseats-api-h1g5.onrender.com";

async function api(endpoint, method = "GET", body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_URL}${endpoint}`, options);

  // если backend вернул ошибку — покажем текст
  const text = await res.text();
  let data = null;

  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    throw new Error(`API ${res.status}: ${text}`);
  }

  return data;
}

module.exports = api;
