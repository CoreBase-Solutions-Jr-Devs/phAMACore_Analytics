import axios from "axios";
import { api } from "../config";

// ============================
// Axios Instances
// ============================

export const API = axios.create({
  baseURL: api.API_URL,
});

export const AuthAPI = axios.create({
  baseURL: api.AUTH_API_URL,
});

export const PowerBIAPI = axios.create({
  baseURL: api.POWERBI_API_URL,
});

// ============================
// Logged In User
// ============================

export const getLoggedinUser = () => {
  const user = localStorage.getItem("authUser");
  return user ? JSON.parse(user) : null;
};

// ============================
// API
// ============================

API.interceptors.request.use(
  (config) => {
    const token = getLoggedinUser()?.token;

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers["Content-Type"] = "application/json";

    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (response) {
      const { data, status } = response;

      if (status === 401) {
        localStorage.removeItem("authUser");
        window.location.href = "/";
      }

      return Promise.reject(data);
    }

    return Promise.reject({
      message: "Network error or server did not respond.",
    });
  }
);

// ============================
// AUTH API
// ============================


AuthAPI.interceptors.request.use(
  (config) => {
    const token = getLoggedinUser()?.token;

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers["Content-Type"] = "application/json";

    const accessKey = process.env.REACT_APP_AUTH_APIKEY;

    if (accessKey) {
      config.headers.accesskey = accessKey;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

AuthAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (response) {
      const { data, status } = response;

      if (status === 401) {
        localStorage.removeItem("authUser");
      }

      return Promise.reject(data);
    }

   console.log("Axios Error:", error);
console.log("Response:", error.response);
console.log("Request:", error.request);

if (error.response) {
  return Promise.reject(error.response.data);
}

return Promise.reject({
  message: error.message,
});
  }
);

// ============================
// POWER BI API
// ============================

PowerBIAPI.interceptors.request.use(
  (config) => {
    const token = getLoggedinUser()?.token;

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers["Content-Type"] = "application/json";

    const accessKey = process.env.REACT_APP_POWERBI_ACCESSKEY;

    if (accessKey) {
      config.headers.accesskey = accessKey;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

PowerBIAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (response) {
      return Promise.reject(response.data);
    }

    return Promise.reject({
      message: "Network error or server did not respond.",
    });
  }
);

// ============================
// Authorization
// ============================

export const setAuthorization = (token) => {
  if (token) {
    API.defaults.headers.common.Authorization = `Bearer ${token}`;
    AuthAPI.defaults.headers.common.Authorization = `Bearer ${token}`;
    PowerBIAPI.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common.Authorization;
    delete AuthAPI.defaults.headers.common.Authorization;
    delete PowerBIAPI.defaults.headers.common.Authorization;
  }
};

// ============================
// Generic API Client
// ============================

class APIClient {
  get = (url, config) => API.get(url, config);

  create = (url, data) => API.post(url, data);

  update = (url, data) => API.patch(url, data);

  put = (url, data) => API.put(url, data);

  delete = (url, config) => API.delete(url, config);
}

export { APIClient };