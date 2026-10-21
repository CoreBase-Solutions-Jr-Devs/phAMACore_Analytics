import { combineReducers } from "redux";

// Front
import LayoutReducer from "./layouts/reducer";

// Authentication
import LoginReducer from "./auth/login/reducer";
import AccountReducer from "./auth/register/reducer";
import ForgetPasswordReducer from "./auth/forgetpwd/reducer";
import ChangePasswordReducer from "./auth/changepassword/reducer";
import ResetPasswordReducer from "./auth/resetpassword/reducer";
import ProfileReducer from "./auth/profile/reducer";
import CustomerMemberAnalysisReducer from "./dashboardSales/CustomerMemberAnalysis/reducer"
import MarginAnalysisReducer from "./dashboardSales/MarginAnalysis/reducer"
import SalesTargetReducer from "./dashboardSales/SalesTarget/reducer"
//Calendar
import CalendarReducer from "./calendar/reducer";

// API Key
import APIKeyReducer from "./apiKey/reducer";

// Power BI
import PowerBIReducer from "./dashboardSales/reducer";

// Stock/Inventory
import StockInventoryReducer from "./dashboardStock/reducer";

 import PurchaseOrdersReducer from "./dashboardPurchase/reducer";

// Dashboard My Business
import DashboardMyBusinessReducer from "./dashboardMyBusiness/reducer";

const rootReducer = combineReducers({
    Layout: LayoutReducer,
    Login: LoginReducer,
    Account: AccountReducer,
    forgotpwd: ForgetPasswordReducer,
    ChangePassword: ChangePasswordReducer,
    ResetPassword: ResetPasswordReducer,
    Profile: ProfileReducer,
    Calendar: CalendarReducer,
    APIKey: APIKeyReducer,
    powerbi: PowerBIReducer,
    PurchaseOrders: PurchaseOrdersReducer,
    StockInventory: StockInventoryReducer,
    DashboardMyBusiness: DashboardMyBusinessReducer,
    MyBusiness: DashboardMyBusinessReducer,
    salesTarget:SalesTargetReducer,
    marginAnalysis:MarginAnalysisReducer,
    customerMemberAnalysis:CustomerMemberAnalysisReducer,
});

export default rootReducer;