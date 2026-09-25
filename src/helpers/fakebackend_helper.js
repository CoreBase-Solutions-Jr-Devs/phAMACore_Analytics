import {
  APIClient,
  AuthAPI,
  PowerBIAPI,
  // LogoutAPI,
  getLoggedinUser,
} from "./api_helper";
import * as url from "./url_helper";

const api = new APIClient();
// const authApi = new AuthAPI();
// const powerBIApi = new PowerBIAPI();

export const getLoggedInUser = () => {
  return getLoggedinUser();
};

// //is user is logged in
export const isUserAuthenticated = () => {
  return getLoggedInUser() !== null;
};
// Login APIs
export const loginUserAPI = (data) => {
  return AuthAPI.post(url.POST_LOGIN, data);
};

export const changePasswordAPI = (data) => {
  return AuthAPI.post(url.POST_CHANGE_PASSWORD, data);
}

export const resetPasswordAPI = (data) => {
  return AuthAPI.post(url.POST_RESET_PASSWORD, data);
};

export const resetTokenAPI = () => {
  return AuthAPI.post(url.POST_RESET_TOKEN);
};

export const profileAPI = (data) => {
  return AuthAPI.put(url.PUT_PROFILE, data);
};

// export const logoutUserAPI = () => {
//   return LogoutAPI.post(url.POST_LOGOUT, );
// };

export const forgotPasswordAPI = (data) => {
  return AuthAPI.post(url.POST_FORGOT_PASSWORD, data);
};


// Power BI APIs
export const getSalesTransactions = (params) =>
  PowerBIAPI.get(url.GET_POWERBI_SALES, { params });
export const getKPISalesTransactions = (params) =>
  PowerBIAPI.get(url.GET_POWERBI_KPISALES, { params });
export const getMonthlySales = (params) =>
  PowerBIAPI.get(url.GET_POWERBI_SALES, { params });
export const getLastYearMonthlySales = (params) =>
  PowerBIAPI.get(url.GET_POWERBI_SALES, { params });
export const getMonthToDateSales = (params) =>
  PowerBIAPI.get(url.GET_POWERBI_SALES, { params });
export const getLastYearMonthToDateSales = (params) =>
  PowerBIAPI.get(url.GET_POWERBI_SALES, { params });
console.log("POWER BI URL:", url.GET_POWERBI_SALES);
export const getKPIOverdueAccounts = (params) =>
  PowerBIAPI.get(url.GET_POWERBI_KPIOverdueAccounts, { params });
export const getPurchaseOrders = (params) =>
  PowerBIAPI.get(url.GET_POWERBI_PURCHASE_ORDERS, { params });
export const getKPIPurchases = (params) =>
  PowerBIAPI.get(url.GET_POWERBI_KPIPURCHASES, { params });
export const getActualSpend = (params) =>
  PowerBIAPI.get(url.GET_POWERBI_KPIPURCHASES, { params });
export const getLastYearActualSpend = (params) =>
  PowerBIAPI.get(url.GET_POWERBI_KPIPURCHASES, { params });
console.log("POWER BI URL:", url.GET_POWERBI_PURCHASE_ORDERS);
export const getDailySpend = (params) =>
  PowerBIAPI.get(url.GET_POWERBI_KPIPURCHASES, { params });
export const getLastYearDailySpend = (params) =>
  PowerBIAPI.get(url.GET_POWERBI_KPIPURCHASES, { params });
console.log("POWER BI URL:", url.GET_POWERBI_PURCHASE_ORDERS);
export const getDailyClosingStock = (params) =>
  PowerBIAPI.get(url.GET_POWERBI_STOCK, { params });
export const getStockMovements = (params) =>
  PowerBIAPI.get(url.GET_POWERBI_MOVEMENTS, { params });
export const getBatchExpiry = (params) => 
  PowerBIAPI.get(url.GET_POWERBI_BATCH_EXPIRY, { params });
export const getBatchExpiryNeo = (params) => 
  PowerBIAPI.get(url.GET_POWERBI_BATCH_EXPIRY_NEO, { params });
export const getBranches = (params) => 
  PowerBIAPI.get(url.GET_POWERBI_BRANCHES, { params });

