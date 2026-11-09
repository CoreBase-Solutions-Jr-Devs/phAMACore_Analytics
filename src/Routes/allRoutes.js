import React from "react";
import { Navigate } from "react-router-dom";

//Dashboard
import DashboardSales from "../pages/DashboardSales";
import DashboardStock from "../pages/DashboardStock";
import CriticalStockLevels from "../pages/DashboardStock/CriticalStockLevels";
import ExpiryWatch from "../pages/DashboardStock/ExpiryWatch";
import SlowMovingStockPage from "../pages/DashboardStock/SlowMovingStock";
import InterBranchImbalances from "../pages/DashboardStock/InterBranchImbalances";
import SellThroughAnalysis from "../pages/DashboardStock/SellThroughAnalysis";
import BranchOrderFillRate from "../pages/DashboardStock/BranchOrderFillRate";
import BranchTransfers from "../pages/DashboardStock/BranchTransfers";
import DashboardPurchaseOrders from "../pages/DashboardPurchaseOrders";
import DashboardMyBusiness from "../pages/DashboardMyBusiness";
import MarginAnalysis from "../pages/DashboardSales/MarginAnalysis";
import CustomerMemberAnalysis from "../pages/DashboardSales/CustomerMemberAnalysis";
// import SalesTarget from "../pages/DashboardSales/SalesTarget";
import PerformanceSummary from "../pages/DashboardSales/PerformanceSummary";
import SalesBreakdown from "../pages/DashboardSales/SalesBreakdown";
import SupplierAgeing from "../pages/DashboardPurchaseOrders/SupplierAgeing";
import CategorySpend from "../pages/DashboardPurchaseOrders/CategorySpend";
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
import BasicTables from "../pages/Tables/BasicTables/BasicTables";
import ListTables from "../pages/Tables/ListTables/ListTables";
import ReactTable from "../pages/Tables/ReactTables";

// User Profile
import UserProfile from "../pages/Authentication/user-profile";
import RangeArea from "../pages/Charts/ApexCharts/RangeAreaCharts/Index";
import CategoryPerformance from "../pages/DashboardSales/CategoryPerformance";
import SalesSummary from "../pages/DashboardSales/SalesSummary";
import BranchOrderFill from "../pages/DashboardPurchaseOrders/BranchOrderFillRate";

const authProtectedRoutes = [
  { path: "/dashboard", component: <DashboardMyBusiness /> },
  { path: "/dashboard/branch/:branchId", component: <DashboardMyBusiness /> },
  // { path: "/index", component: <DashboardMyBusiness /> },
  { path: "/dashboard-sales", component: <DashboardSales /> },
  { path: "/dashboard-sales/Margin-Analysis", component: <MarginAnalysis /> },
  {
    path: "/dashboard-sales/Customer-Member-Analysis",
    component: <CustomerMemberAnalysis />,
  },
  // { path: "/dashboard-sales/Sales-Target", component: <SalesTarget /> },
  {
    path: "/dashboard-sales/Performance-Summary",
    component: <PerformanceSummary />,
  },
  {
    path: "/dashboard-sales/Sales-Breakdown",
    component: <SalesBreakdown/>,
  },
    {
    path: "/dashboard-sales/Category-Performance",
    component: <CategoryPerformance/>,
  },
     {
    path: "/dashboard-sales/Sales-Summary",
    component: <SalesSummary/>,
  },
  { path: "/dashboard-sales/branch/:branchId", component: <DashboardSales /> },
  { path: "/dashboard-stock", component: <DashboardStock /> },
  {
    path: "/dashboard-stock/Critical-Stock-Levels",
    component: <CriticalStockLevels />,
  },
  {
    path: "/dashboard-stock/Expiry-Watch",
    component: <ExpiryWatch />,
  },
  {
    path: "/dashboard-stock/Slow-Moving-Stock",
    component: <SlowMovingStockPage />,
  },
  {
    path: "/dashboard-stock/Inter-Branch-Imbalances",
    component: <InterBranchImbalances />,
  },
  {
    path: "/dashboard-stock/Sell-Through-Analysis",
    component: <SellThroughAnalysis />,
  },
  {
    path: "/dashboard-stock/Branch-Order-Fill-Rate",
    component: <BranchOrderFillRate />,
  },
  {
    path: "/dashboard-stock/Branch-Transfers",
    component: <BranchTransfers />,
  },
  { path: "/dashboard-stock/branch/:branchId", component: <DashboardStock /> },
  {
    path: "/dashboard-purchase-orders",
    component: <DashboardPurchaseOrders />,
  },
  //   {
  //   path: "/dashboard-purchase-orders/Recent-Orders",
  //   component: <RecentOrders />,
  // },
  {
    path: "/dashboard-purchase-orders/Supplier-Ageing",
    component: <SupplierAgeing />,
  },
   {
    path: "/dashboard-purchase-orders/Category-Spend",
    component: <CategorySpend />,
  },
     {
    path: "/dashboard-purchase-orders/Branch-Order-Fill-Rate",
    component: <BranchOrderFill />,
  },
  {
    path: "/dashboard-purchase-orders/branch/:branchId",
    component: <DashboardPurchaseOrders />,
  },

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
];

export { authProtectedRoutes, publicRoutes };
