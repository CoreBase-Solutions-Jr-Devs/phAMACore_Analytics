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

const connectionDb = process.env.REACT_APP_CONNECTION_DB || api.CONNECTION_DB;
if (connectionDb) {
  API.defaults.headers.common["connectiondb"] = connectionDb;
  AuthAPI.defaults.headers.common["connectiondb"] = connectionDb;
  PowerBIAPI.defaults.headers.common["connectiondb"] = connectionDb;
}

// Helper to attach connectiondb header or query param without overwriting
const applyConnectionDb = (config) => {
  if (!connectionDb) return config;

  config.headers = config.headers || {};

  // 1. Check if caller already supplied connectiondb in headers (case-insensitive)
  const hasConnectionDbHeader = Object.keys(config.headers).some(
    (key) => key.toLowerCase() === "connectiondb"
  );
  if (!hasConnectionDbHeader) {
    config.headers.connectiondb = connectionDb;
  }

  // 2. Check if endpoint expects connectiondb as a query param
  // (e.g. /api/PowerBI/SalesTransactions vs /api/PowerBI/PowerBISalesTransactions)
  const url = config.url || "";
  const isPowerBIHeaderEndpoint = /\/api\/PowerBi\/PowerBI/i.test(url);
  const isParamEndpoint = !isPowerBIHeaderEndpoint && /\/api\/PowerBi\//i.test(url);

  if (isParamEndpoint) {
    config.params = config.params || {};
    const hasConnectionDbParam = Object.keys(config.params).some(
      (key) => key.toLowerCase() === "connectiondb"
    );
    if (!hasConnectionDbParam) {
      config.params.connectiondb = connectionDb;
    }
  }

  return config;
};

// ============================
// Dynamic Client ID (Always Integer)
// ============================

export const getClientId = (explicitId) => {
  // If caller explicitly passed a non-default ID, respect it as integer
  if (explicitId !== undefined && explicitId !== null && explicitId !== "" && Number(explicitId) !== 1) {
    const parsed = parseInt(explicitId, 10);
    if (!isNaN(parsed)) return parsed;
  }

  // 1. Try logged-in user session (authUser in localStorage)
  try {
    const user = getLoggedinUser();
    const userClientId =
      user?.clientid ?? user?.clientId ?? user?.ClientID ?? user?.client_id ??
      user?.clientPin ?? user?.user?.clientid ?? user?.user?.clientId;

    if (userClientId !== undefined && userClientId !== null && userClientId !== "") {
      const parsed = parseInt(userClientId, 10);
      if (!isNaN(parsed)) return parsed;
    }
  } catch (e) {
    // ignore
  }

  // 2. Try explicit localStorage item
  try {
    const stored =
      localStorage.getItem("clientId") || localStorage.getItem("clientid") || localStorage.getItem("client_id");

    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed)) return parsed;
    }
  } catch (e) {
    // ignore
  }

  // 3. Try environment variable or config
  const envId = process.env.REACT_APP_CLIENT_ID || process.env.REACT_APP_CLIENTID || api?.CLIENT_ID;

  if (envId !== undefined && envId !== null && envId !== "") {
    const parsed = parseInt(envId, 10);
    if (!isNaN(parsed)) return parsed;
  }

  // 4. If explicitId was 1, return integer 1
  if (explicitId !== undefined && explicitId !== null && !isNaN(parseInt(explicitId, 10))) {
    return parseInt(explicitId, 10);
  }

  // 5. Default fallback integer
  return 1;
};

export const setClientId = (id) => {
  if (id !== null && id !== undefined && id !== "") {
    const intId = parseInt(id, 10);
    localStorage.setItem("clientId", String(intId));
    return intId;
  } else {
    localStorage.removeItem("clientId");
  }
};

const applyClientId = (config) => {
  // 1. If config.params is present, find clientid or attach it
  if (config.params) {
    const clientKey = Object.keys(config.params).find(
      (k) => k.toLowerCase() === "clientid"
    );
    if (clientKey) {
      config.params[clientKey] = getClientId(config.params[clientKey]);
    } else {
      config.params.clientid = getClientId();
    }
  } else {
    // For PowerBI GET requests or requests that use query params, ensure clientid exists as integer
    const url = config.url || "";
    if (/\/api\/PowerBi\//i.test(url) || (config.method && config.method.toLowerCase() === "get")) {
      config.params = config.params || {};
      config.params.clientid = getClientId();
    }
  }

  // 2. If body data is an object with clientid, also ensure integer
  if (config.data && typeof config.data === "object" && !(config.data instanceof FormData)) {
    const dataClientKey = Object.keys(config.data).find(
      (k) => k.toLowerCase() === "clientid"
    );
    if (dataClientKey) {
      config.data[dataClientKey] = getClientId(config.data[dataClientKey]);
    }
  }

  return config;
};

// ============================
// API
// ============================

API.interceptors.request.use(
  (config) => {
    const token = getLoggedinUser()?.token;

    config.headers = config.headers || {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    applyConnectionDb(config);
    applyClientId(config);

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

    config.headers = config.headers || {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    applyConnectionDb(config);
    applyClientId(config);

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

    config.headers = config.headers || {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    applyConnectionDb(config);
    applyClientId(config);

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