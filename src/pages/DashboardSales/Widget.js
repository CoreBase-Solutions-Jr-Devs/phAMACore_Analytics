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
import { exportDashboardReportToExcel, triggerPrint } from "../../helpers/export_helper";

const Widget = ({
  totalRevenue = 0,
  cashSales = 0,
  salesInvoices = 0,
  cashInvoices = 0,
  creditNotes=0,
  // ordersReceived = 0,
  formatAmount,
  cashSalesPercentage = 0,
  overdueDebtorsCount=0,
  salesInvoicesPercentage = 0,
  cashInvoicesPercentage = 0,
  creditNotesPercentage = 0,
  lastYearRevenue= 0,
  revenueChange = 0,
  branchMap = {},
  rightClickBtn,
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
      { label: "Date Range Filter", value: `${startDate || ""} to ${endDate || ""}` },
    ];

    const kpiMetricsRows = [
      { Metric: "Total Revenue", Value: typeof formatAmount === "function" ? formatAmount(totalRevenue) : Number(totalRevenue || 0).toLocaleString(), Notes: "Tax inclusive" },
      { Metric: "Cash Sales", Value: typeof formatAmount === "function" ? formatAmount(cashSales) : Number(cashSales || 0).toLocaleString(), Notes: `${cashSalesPercentage}% of revenue` },
      { Metric: "Sales Invoices", Value: typeof formatAmount === "function" ? formatAmount(salesInvoices) : Number(salesInvoices || 0).toLocaleString(), Notes: `${salesInvoicesPercentage}% of revenue` },
      { Metric: "Cash Invoices", Value: typeof formatAmount === "function" ? formatAmount(cashInvoices) : Number(cashInvoices || 0).toLocaleString(), Notes: `${cashInvoicesPercentage}% of revenue` },
      { Metric: "Credit Notes", Value: typeof formatAmount === "function" ? formatAmount(creditNotes) : Number(creditNotes || 0).toLocaleString(), Notes: `${creditNotesPercentage}% of revenue` },
      { Metric: "Overdue Debtors Count", Value: overdueDebtorsCount, Notes: "Accounts with overdue balance" },
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
      fileName
    );
  };

  const handlePrint = () => {
    triggerPrint();
  };

  return (
    <React.Fragment>
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
        <h4 className="card-title mb-0">
          KEY METRICS
        </h4>

        <div className="d-flex align-items-center gap-2 ">
          <span>Filtered From:</span>
          <strong>{formatDisplay(startDate)}</strong> to{" "}
          <strong>{formatDisplay(endDate)}</strong>
        </div>

        <div className="d-flex align-items-center gap-2 no-print">
          <button
            type="button"
            className="btn btn-soft-success d-flex align-items-center gap-1"
            onClick={handleExportExcel}
            title="Export Key Metrics to Excel"
          >
            <i className="ri-file-excel-2-line align-bottom"></i>
            <span>Export Excel</span>
          </button>

          <button
            type="button"
            className="btn btn-soft-info d-flex align-items-center gap-1"
            onClick={handlePrint}
            title="Print Dashboard"
          >
            <i className="ri-printer-line align-bottom"></i>
            <span>Print</span>
          </button>

          <button
            type="button"
            className="btn btn-caramel d-flex align-items-center gap-2 layout-rightside-btn"
            onClick={rightClickBtn}
          >
            <i className="ri-filter-fill"></i>
            Filter
          </button>
        </div>
      </div>
<Row className="g-2 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-6" id="sales-kpi-widgets">
  <Col className="d-flex">
<Card className="card-animate w-100 h-80">
            <CardBody className="p-2 d-flex flex-column">
        <div>
          <p className="font-medium mb-0">Total Revenue</p>

          <h2 className="mt-2 ff-secondary fw-semibold text-success">
            KES {Number(totalRevenue || 0).toLocaleString("en-KE")}
          </h2>
</div>
          <p className="mb-0 text-muted mt-auto">
            {/* <i
              className={`${
                revenueChange > 0
                  ? "ri-arrow-up-line"
                  : revenueChange < 0
                    ? "ri-arrow-down-line"
                    : "ri-subtract-line"
              } align-middle`}
            ></i>
            {` ${Math.abs(revenueChange).toFixed(1)}% vs yesterday`} */}
               Tax inclusive
          </p>
       

        {/* <div className="avatar-sm flex-shrink-0">
      <span className="avatar-title bg-success-subtle rounded-circle fs-6 fw-bold text-success">
  KSh
</span>
        </div> */}
     
    </CardBody>
  </Card>
</Col>

<Col className="d-flex">
       <Card className="card-animate w-100 h-80">
            <CardBody className="p-2 d-flex flex-column">
        <div>
                  <p className="font-medium  mb-0">Cash Sales</p>
                  <h2 className="mt-2 ff-secondary fw-semibold text-info">
                    <span className="counter-value">
                      {/* <CountUp
                                        start={0}
                                        end={Number(cashSales || 0)}
                                        decimals={1}
                                        duration={3}
                                        formattingFn={(value) => formatAmount(value)}
                                    /> */}
                      KES {Number(cashSales || 0).toLocaleString("en-KE")}
                    </span>
                  </h2>
                  </div>
                  <p className="mb-0 text-muted mt-auto">
                    {cashSalesPercentage.toFixed(1)}% of total
                  </p>
             

                {/* <div className="avatar-sm flex-shrink-0">
                  <span className="avatar-title bg-info-subtle rounded-circle fs-2">
                    <FeatherIcon icon="shopping-cart" className="text-info" />
                  </span>
                </div> */}
             
            </CardBody>
          </Card>
        </Col>

<Col className="d-flex">
   <Card className="card-animate w-100 h-80">
            <CardBody className="p-2 d-flex flex-column">
        <div>
                  <p className="font-medium  mb-0">Sales Invoices</p>
                  <h2 className="mt-2 ff-secondary fw-semibold text-danger">
                    <span className="counter-value">
                      {/* <CountUp
                                        start={0}
                                        end={Number(creditSales || 0)}
                                        decimals={1}
                                        duration={3}
                                        formattingFn={(value) => formatAmount(value)}
                                    /> */}
                      KES {Number(salesInvoices || 0).toLocaleString("en-KE")}
                    </span>
                  </h2>
                  </div>
                  <p className="mb-0 text-muted mt-auto">
                    {" "}
                    {salesInvoicesPercentage.toFixed(1)}% of total
                  </p>
              

                {/* <div className="avatar-sm flex-shrink-0">
                  <span className="avatar-title bg-danger-subtle rounded-circle fs-2">
                    <FeatherIcon icon="credit-card" className="text-danger" />
                  </span>
                </div> */}
              
            </CardBody>
          </Card>
        </Col>

<Col className="d-flex">
         <Card className="card-animate h-80 w-100">
         <CardBody className="p-2 d-flex flex-column">
        <div>
                  <p className="font-medium  mb-0">Cash invoices</p>
                  <h2 className="mt-2 ff-secondary fw-semibold text-warning">
                    <span className="counter-value">
                      {/* <CountUp
                                        start={0}
                                        end={Number(cashInvoices || 0)}
                                        decimals={1}
                                        duration={3}
                                    /> */}
                      KES {Number(cashInvoices || 0).toLocaleString("en-KE")}
                    </span>
                    
                  </h2>
                   </div>
                  <p className="mb-0 text-muted mt-auto">
                    {cashInvoicesPercentage.toFixed(1)}% of total
                  </p>
               

                {/* <div className="avatar-sm flex-shrink-0">
                  <span className="avatar-title bg-warning-subtle rounded-circle fs-2">
                    <FeatherIcon icon="briefcase" className="text-warning" />
                  </span>
                </div> */}
            </CardBody>
          </Card>
        </Col>
{/* 
        <Col xl={3} lg={4} md={6} sm={12} xs={12}>
          <Card className="card-animate h-100">
            <CardBody className="p-2">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="font-medium  mb-0">Outstanding</p>
                  <h2 className="mt-4 ff-secondary fw-semibold text-success">
                    <span className="counter-value">
                      <CountUp start={0} end={0.0} decimals={1} duration={3} />
                    </span>
                  </h2>
                  <p className="mb-0 text-muted">Total receivables</p>
                </div>

                <div className="avatar-sm flex-shrink-0">
                  <span className="avatar-title bg-success-subtle rounded-circle fs-2">
                    <FeatherIcon icon="alert-circle" className="text-success" />
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col> */}

<Col className="d-flex">
            <Card className="card-animate w-100 h-80">
            <CardBody className="p-2 d-flex flex-column">
        <div>
                  <p className="font-medium  mb-0">Credit Notes </p>
                  <h2 className="mt-2 ff-secondary fw-semibold text-info">
                    <span className="counter-value">
                      KES {Number(creditNotes || 0).toLocaleString("en-KE")}
                    </span>
                  </h2>
                  </div>
                  <p className="mb-0 text-muted mt-auto">
                    {creditNotesPercentage.toFixed(1)}% of total
                  </p>
                
{/* 
                <div className="avatar-sm flex-shrink-0">
                  <span className="avatar-title bg-info-subtle rounded-circle fs-2">
                    <FeatherIcon icon="users" className="text-info" />
                  </span>
                </div> */}
            </CardBody>
          </Card>
        </Col>

        {/* <Col xl={3} lg={4} md={6} sm={12} xs={12}>
          <Card className="card-animate h-100">
            <CardBody className="p-2">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="font-medium  mb-0">Collections</p>
                  <h2 className="mt-4 ff-secondary fw-semibold text-danger">
                    <span className="counter-value">
                      <CountUp start={0} decimals={1} end={0.0} duration={3} />
                    </span>
                  </h2>
                  <p className="mb-0 text-muted">0% collection rate</p>
                </div>

                <div className="avatar-sm flex-shrink-0">
                  <span className="avatar-title bg-danger-subtle rounded-circle fs-2">
                    <FeatherIcon icon="package" className="text-danger" />
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col> */}


<Col className="d-flex">
          <Card className="card-animate w-100 h-80">
          <CardBody className="p-2 d-flex flex-column">
        <div>
                  <p className="font-medium  mb-0">Overdue Accounts</p>
                  <h2 className="mt-2 ff-secondary fw-semibold text-warning">
                    <span className="counter-value">
                      KES {formatAmount(Number(overdueDebtorsCount|| 0))}
                    </span>
                  </h2>
                    </div>
                  <p className="mb-0 text-muted mt-auto">At risk</p>
              

                {/* <div className="avatar-sm flex-shrink-0">
                  <span className="avatar-title bg-warning-subtle rounded-circle fs-2">
                    <FeatherIcon icon="clock" className="text-warning" />
                  </span>
                </div> */}
           
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default Widget;
