import React from "react";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import CountUp from "react-countup";
import FeatherIcon from "feather-icons-react";
// import {
//   setBranch,
//   setDateRange,
//   setStartDate,
//   setEndDate,

// } from "../../slices/dashboardSales/reducer";
import { useDispatch, useSelector } from "react-redux";
import {
  exportDashboardReportToExcel,
  triggerPrint,
} from "../../helpers/export_helper";

const Widget = ({
  totalRevenue = 0,
  cashSales = 0,
  salesInvoices = 0,
  cashInvoices = 0,
  creditNotes = 0,
  // ordersReceived = 0,
  formatAmount,
  cashSalesPercentage = 0,
  overdueDebtorsCount = 0,
  salesInvoicesPercentage = 0,
  cashInvoicesPercentage = 0,
  creditNotesPercentage = 0,
  lastYearRevenue = 0,
  revenueChange = 0,
  selectedBranchName,
  branchMap = {},
  rightClickBtn,
  error,
  loading,
}) => {
  const { branch, dateRange, startDate, endDate } = useSelector(
    (state) => state.powerbi.filters,
  );
  const formatDisplay = (date) => date || "";

  const handleExportExcel = () => {
    const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    const fileName = `Sales_Dashboard_Analytics_${todayStr}`;

    const metadata = [
      { label: "Report", value: "Sales Dashboard Key Metrics" },
      { label: "Generated Date", value: new Date().toLocaleString("en-GB") },
      {
        label: "Date Range Filter",
        value: `${startDate || ""} to ${endDate || ""}`,
      },
    ];

    const kpiMetricsRows = [
      {
        Metric: "Total Revenue",
        Value:
          typeof formatAmount === "function"
            ? formatAmount(totalRevenue)
            : Number(totalRevenue || 0).toLocaleString(),
        Notes: "Tax inclusive",
      },
      {
        Metric: "Cash Sales",
        Value:
          typeof formatAmount === "function"
            ? formatAmount(cashSales)
            : Number(cashSales || 0).toLocaleString(),
        Notes: `${cashSalesPercentage}% of revenue`,
      },
      {
        Metric: "Sales Invoices",
        Value:
          typeof formatAmount === "function"
            ? formatAmount(salesInvoices)
            : Number(salesInvoices || 0).toLocaleString(),
        Notes: `${salesInvoicesPercentage}% of revenue`,
      },
      {
        Metric: "Cash Invoices",
        Value:
          typeof formatAmount === "function"
            ? formatAmount(cashInvoices)
            : Number(cashInvoices || 0).toLocaleString(),
        Notes: `${cashInvoicesPercentage}% of revenue`,
      },
      {
        Metric: "Credit Notes",
        Value:
          typeof formatAmount === "function"
            ? formatAmount(creditNotes)
            : Number(creditNotes || 0).toLocaleString(),
        Notes: `${creditNotesPercentage}% of revenue`,
      },
      {
        Metric: "Overdue Debtors Count",
        Value: overdueDebtorsCount,
        Notes: "Accounts with overdue balance",
      },
    ];

    const sections = [
      {
        title: "Key Sales Metrics",
        headers: ["Metric", "Value", "Notes"],
        data: kpiMetricsRows,
      },
    ];

    exportDashboardReportToExcel(
      {
        title: "Sales Analytics Report",
        metadata,
        sections,
      },
      fileName,
    );
  };

  const handlePrint = () => {
    triggerPrint();
  };

  return (
    <React.Fragment>   
     {Object.values(loading || {}).some(Boolean) ? (
          <div className="text-center py-5">
            <div
              className="spinner-border text-primary"
              role="status"
              aria-label="Loading performance metrics"
            ></div>
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <p className="text-danger mb-0">{error}</p>
          </div>
        ) : (
      <Row
        className="g-2 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-6"
        id="sales-kpi-widgets"
      >
        <Col className="d-flex">
          <Card className="card-animate w-100 h-80">
            <CardBody className="p-2 d-flex flex-column">
              <div>
                <p className="font-medium mb-0">Total Revenue</p>

                <h5 className="mt-2 ff-secondary fw-semibold text-success">
                  KES {Number(totalRevenue || 0).toLocaleString("en-KE")}
                </h5>
              </div>
              <p className="mb-0 text-muted mt-auto">
                Tax inclusive
              </p>
            </CardBody>
          </Card>
        </Col>

        <Col className="d-flex">
          <Card className="card-animate w-100 h-80">
            <CardBody className="p-2 d-flex flex-column">
              <div>
                <p className="font-medium  mb-0">Cash Sales</p>
                <h5 className="mt-2 ff-secondary fw-semibold text-info">
                  <span className="counter-value">
                    KES {Number(cashSales || 0).toLocaleString("en-KE")}
                  </span>
                </h5>
              </div>
              <p className="mb-0 text-muted mt-auto">
                {cashSalesPercentage.toFixed(1)}% of total
              </p>
            </CardBody>
          </Card>
        </Col>

        <Col className="d-flex">
          <Card className="card-animate w-100 h-80">
            <CardBody className="p-2 d-flex flex-column">
              <div>
                <p className="font-medium  mb-0">Sales Invoices</p>
                <h5 className="mt-2 ff-secondary fw-semibold text-danger">
                  <span className="counter-value">
                    KES {Number(salesInvoices || 0).toLocaleString("en-KE")}
                  </span>
                </h5>
              </div>
              <p className="mb-0 text-muted mt-auto">
                {" "}
                {salesInvoicesPercentage.toFixed(1)}% of total
              </p>
            </CardBody>
          </Card>
        </Col>

        <Col className="d-flex">
          <Card className="card-animate h-80 w-100">
            <CardBody className="p-2 d-flex flex-column">
              <div>
                <p className="font-medium  mb-0">Cash invoices</p>
                <h5 className="mt-2 ff-secondary fw-semibold text-warning">
                  <span className="counter-value">
                    KES {Number(cashInvoices || 0).toLocaleString("en-KE")}
                  </span>
                </h5>
              </div>
              <p className="mb-0 text-muted mt-auto">
                {cashInvoicesPercentage.toFixed(1)}% of total
              </p>
            </CardBody>
          </Card>
        </Col>       

        <Col className="d-flex">
          <Card className="card-animate w-100 h-80">
            <CardBody className="p-2 d-flex flex-column">
              <div>
                <p className="font-medium  mb-0">Credit Notes </p>
                <h5 className="mt-2 ff-secondary fw-semibold text-info">
                  <span className="counter-value">
                    KES {Number(creditNotes || 0).toLocaleString("en-KE")}
                  </span>
                </h5>
              </div>
              <p className="mb-0 text-muted mt-auto">
                {creditNotesPercentage.toFixed(1)}% of total
              </p>
            </CardBody>
          </Card>
        </Col>

        <Col className="d-flex">
          <Card className="card-animate w-100 h-80">
            <CardBody className="p-2 d-flex flex-column">
              <div>
                <p className="font-medium  mb-0">Overdue Accounts</p>
                <h5 className="mt-2 ff-secondary fw-semibold text-warning">
                  <span className="counter-value">
                   {formatAmount(Number(overdueDebtorsCount || 0))}
                  </span>
                </h5>
              </div>
              <p className="mb-0 text-muted mt-auto">At risk</p>

            </CardBody>
          </Card>
        </Col>
      </Row>
       )}
    </React.Fragment>
  );
};

export default Widget;
