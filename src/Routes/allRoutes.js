import React from "react";
import { Navigate } from "react-router-dom";

//Dashboard
import DashboardSales from "../pages/DashboardSales";
// import DashboardSalesBranch from "../pages/DashboardSalesBranch";
// import DashboardPurchaseOrdersBranch from "../pages/DashboardPurchaseOrdersBranch";
import DashboardStock from "../pages/DashboardStock";
import DashboardPurchaseOrders from "../pages/DashboardPurchaseOrders";
import DashboardCrypto from "../pages/DashboardCrypto";
import DashboardMyBusiness from "../pages/DashboardMyBusiness";
import DashboardProject from "../pages/DashboardProject";
import DashboardNFT from "../pages/DashboardNFT";
import DashboardJob from "../pages/DashboardJob/";

//AuthenticationInner pages
import BasicSignIn from '../pages/AuthenticationInner/Login/BasicSignIn';
import CoverSignIn from '../pages/AuthenticationInner/Login/CoverSignIn';
import BasicSignUp from '../pages/AuthenticationInner/Register/BasicSignUp';
import CoverSignUp from "../pages/AuthenticationInner/Register/CoverSignUp";
import BasicPasswReset from '../pages/AuthenticationInner/PasswordReset/BasicPasswReset';
import Basic404 from '../pages/AuthenticationInner/Errors/Basic404';
import Cover404 from '../pages/AuthenticationInner/Errors/Cover404';
import Alt404 from '../pages/AuthenticationInner/Errors/Alt404';
import Error500 from '../pages/AuthenticationInner/Errors/Error500';

//login
import Login from "../pages/Authentication/Login";
import ForgetPasswordPage from "../pages/Authentication/ForgetPassword";
import ChangePassword from "../pages/Authentication/ChangePassword";
import ResetPassword from "../pages/Authentication/ResetPassword";
import Logout from "../pages/Authentication/Logout";
import Register from "../pages/Authentication/Register";

//Charts
import LineCharts from "../pages/Charts/ApexCharts/LineCharts";
import AreaCharts from "../pages/Charts/ApexCharts/AreaCharts";
import ColumnCharts from "../pages/Charts/ApexCharts/ColumnCharts";
import BarCharts from "../pages/Charts/ApexCharts/BarCharts";
import MixedCharts from "../pages/Charts/ApexCharts/MixedCharts";
import TimelineCharts from "../pages/Charts/ApexCharts/TimelineCharts";
import CandlestickChart from "../pages/Charts/ApexCharts/CandlestickChart";
import BoxplotCharts from "../pages/Charts/ApexCharts/BoxplotCharts";
import BubbleChart from "../pages/Charts/ApexCharts/BubbleChart";
import ScatterCharts from "../pages/Charts/ApexCharts/ScatterCharts";
import HeatmapCharts from "../pages/Charts/ApexCharts/HeatmapCharts";
import TreemapCharts from "../pages/Charts/ApexCharts/TreemapCharts";
import PieCharts from "../pages/Charts/ApexCharts/PieCharts";
import RadialbarCharts from "../pages/Charts/ApexCharts/RadialbarCharts";
import RadarCharts from "../pages/Charts/ApexCharts/RadarCharts";
import PolarCharts from "../pages/Charts/ApexCharts/PolarCharts";
import ChartsJs from "../pages/Charts/ChartsJs/index";
import Echarts from "../pages/Charts/ECharts/index";

//Tables
import BasicTables from '../pages/Tables/BasicTables/BasicTables';
import ListTables from '../pages/Tables/ListTables/ListTables';
import ReactTable from "../pages/Tables/ReactTables";

// User Profile
import UserProfile from "../pages/Authentication/user-profile";
import RangeArea from "../pages/Charts/ApexCharts/RangeAreaCharts/Index";

const authProtectedRoutes = [
  { path: "/dashboard", component: <DashboardMyBusiness /> },
    // { path: "/index", component: <DashboardMyBusiness /> },
  { path: "/dashboard-sales", component: <DashboardSales /> },
  { path: "/dashboard-sales/branch/:branchId", component: <DashboardSales /> },
  { path: "/dashboard-stock", component: <DashboardStock /> },
  { path: "/dashboard-purchase-orders", component: <DashboardPurchaseOrders /> },
  { path: "/dashboard-purchase-orders/branch/:branchId", component: <DashboardPurchaseOrders /> },
  { path: "/dashboard-crypto", component: <DashboardCrypto /> },
  { path: "/dashboard-projects", component: <DashboardProject /> },
  { path: "/dashboard-nft", component: <DashboardNFT /> },
  { path: "/dashboard-job", component: <DashboardJob /> },

  
  { path: "/charts-apex-line", component: <LineCharts /> },
  { path: "/charts-apex-area", component: <AreaCharts /> },
  { path: "/charts-apex-column", component: <ColumnCharts /> },
  { path: "/charts-apex-bar", component: <BarCharts /> },
  { path: "/charts-apex-mixed", component: <MixedCharts /> },
  { path: "/charts-apex-timeline", component: <TimelineCharts /> },
  { path: "/charts-chartjs", component: <ChartsJs /> },
  { path: "/charts-echarts", component: <Echarts /> },

  { path: "/tables-basic", component: <BasicTables /> },
  { path: "/tables-listjs", component: <ListTables /> },
  { path: "/tables-react", component: <ReactTable /> },

  { path: "/profile", component: <UserProfile /> },

 
];

const publicRoutes = [
    { path: "/", component: <Navigate to="/login" replace /> },

  { path: "/logout", component: <Logout /> },
  { path: "/login", component: <Login /> },
  { path: "/forgot-password", component: <ForgetPasswordPage /> },
  { path: "/change-password", component: <ChangePassword /> },
  { path: "/reset-password", component: <ResetPassword /> },
  { path: "/register", component: <Register /> },

  { path: "/auth-signin-basic", component: <BasicSignIn /> },
  { path: "/auth-signin-cover", component: <CoverSignIn /> },
  { path: "/auth-signup-basic", component: <BasicSignUp /> },
  { path: "/auth-signup-cover", component: <CoverSignUp /> },
  { path: "/auth-pass-reset-basic", component: <BasicPasswReset /> },
  { path: "/auth-404-basic", component: <Basic404 /> },
  { path: "/auth-404-cover", component: <Cover404 /> },
  { path: "/auth-404-alt", component: <Alt404 /> },
  { path: "/auth-500", component: <Error500 /> },
];

export { authProtectedRoutes, publicRoutes };
