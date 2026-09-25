import { AuthAPI, PowerBIAPI, LogoutAPI  } from "./api_helper";

import { setAuthorization } from "./api_helper";


//REGISTER
export const POST_FAKE_REGISTER = "/auth/signup";

//LOGIN
export const POST_FAKE_LOGIN = "/auth/signin";
export const POST_FAKE_JWT_LOGIN = "/post-jwt-login";
export const POST_FAKE_PASSWORD_FORGET = "/auth/forgot-password";
export const POST_CHANGE_PASSWORD = "/auth/change-password";
export const POST_RESET_PASSWORD = "/auth/reset-password";
export const POST_RESET_TOKEN = "/auth/reset-token";
export const POST_FAKE_JWT_PASSWORD_FORGET = "/jwt-forget-pwd";
export const SOCIAL_LOGIN = "/social-login";

// CURRENT LOGIN
export const POST_LOGIN = "/Auth";
export const PUT_PROFILE = "/auth/profile";

export const POST_FORGOT_PASSWORD = "/auth/reset-token";
// Power BI APIs
export const GET_POWERBI_SALES =
  "/api/PowerBi/PowerBISalesTransactions";

  export const GET_POWERBI_KPISALES =
  "/api/PowerBi/PowerBIKPISalesTransactions";

  export const GET_POWERBI_KPIOverdueAccounts =
  "/api/PowerBi/PowerBIKPIOverdueAccounts";

export const GET_POWERBI_PURCHASE_ORDERS =
  "/api/PowerBi/PowerBIPurchaseOrders";

    export const GET_POWERBI_KPIPURCHASES =
  "/api/PowerBi/PowerBIKPIPurchases";

export const GET_POWERBI_STOCK =
  "/api/PowerBi/PowerBIDailyClosingStock";

export const GET_POWERBI_MOVEMENTS =
  "/api/PowerBi/PowerBIStockMovements";

export const GET_POWERBI_BATCH_EXPIRY =
  "/api/PowerBi/PowerBIBatchExpireDetails";

export const GET_POWERBI_BATCH_EXPIRY_NEO = 
  "/api/PowerBi/PowerBIBatchExpireDetailsNeo";

export const GET_POWERBI_BRANCHES = 
  "/api/PowerBi/PowerBIBranches";

export const GET_POWERBI_KPI_OVERDUE_ACCOUNTS =
  "/api/PowerBi/PowerBIKPIOverdueAccounts";



export const GET_POWERBI_KPI_TOTALSTOCKVALUEBYBRANCH =
  "/api/PowerBi/PowerBIKPITotalStockValueByBranch";



export const GET_POWERBI_KPI_STOCKHEALTH = 
  "/api/PowerBi/PowerBIKPIStockHealth";

//PROFILE
export const POST_EDIT_JWT_PROFILE = "/post-jwt-profile";
export const POST_EDIT_PROFILE = "/user";

export const POST_LOGOUT = "/Auth/Logout";
