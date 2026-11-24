import React, { useState } from "react";
import { Card, CardBody, Row, Col } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  exportDashboardReportToExcel,
  triggerPrint,
} from "../../../helpers/export_helper";
const Category = ({
  categoryPerformance,
    categoryAvgOrderValue,
    categoryGrossMargin,
  selectedBranchName,
  error,
  loading,
  rightClickBtn,
}) => {
  
  const { branch, dateRange, startDate, endDate } = useSelector(
    (state) => state.categoryPerformance.filters,
  );

const categoryTotals = (
  Array.isArray(categoryPerformance) ? categoryPerformance : []
).reduce(
  (totals, item) => ({
    total_sales_excl:
      totals.total_sales_excl + Number(item.total_sales_excl ?? 0),

    total_sales_incl:
      totals.total_sales_incl + Number(item.total_sales_incl ?? 0),

    total_tax:
      totals.total_tax + Number(item.total_tax ?? 0),

    total_cogs:
      totals.total_cogs + Number(item.total_cogs ?? 0),

    gross_profit:
      totals.gross_profit + Number(item.gross_profit ?? 0),

    total_units_sold:
      totals.total_units_sold + Number(item.total_units_sold ?? 0),

    active_items_count:
      totals.active_items_count + Number(item.active_items_count ?? 0),

    transaction_count:
      totals.transaction_count + Number(item.transaction_count ?? 0),

    total_line_items:
      totals.total_line_items + Number(item.total_line_items ?? 0),

    unique_clients:
      totals.unique_clients + Number(item.unique_clients ?? 0),

    avg_order_value:
      totals.avg_order_value + Number(item.avg_order_value ?? 0),

    gross_margin_perc:
      totals.gross_margin_perc + Number(item.gross_margin_perc ?? 0),

    sales_share_perc:
      totals.sales_share_perc + Number(item.sales_share_perc ?? 0),

  }),
  {
    total_sales_excl: 0,
    total_sales_incl: 0,
    total_tax: 0,
    total_cogs: 0,
    gross_profit: 0,
    total_units_sold: 0,
    active_items_count: 0,
    transaction_count: 0,
    total_line_items: 0,
    unique_clients: 0,
    avg_order_value: 0,
    gross_margin_perc: 0,
    sales_share_perc: 0,
  },
);
const grossMarginPercentage =
  categoryTotals.total_sales_excl > 0
    ? (categoryTotals.gross_profit / categoryTotals.total_sales_excl) * 100
    : 0;
const handleExportExcel = () => {
  const todayStr = new Date()
    .toLocaleDateString("en-GB")
    .replace(/\//g, "-");

  const fileName = `Product_Performance_Key_Metrics_${todayStr}`;

  const metadata = [
    {
      label: "Report",
      value: "Product Performance Key Metrics",
    },
    {
      label: "Generated Date",
      value: new Date().toLocaleString("en-GB"),
    },
    {
      label: "Selected Branch",
      value: selectedBranchName || "All Branches",
    },
    {
      label: "Date Range Filter",
      value: `${startDate || ""} to ${endDate || ""}`,
    },
  ];

  const rows = [
    {
      Metric: "Net Sales (KES, Excluding Tax)",
      Value: Number(categoryPerformance?.total_sales_excl ?? 0),
    },
    {
      Metric: "Gross Profit (KES)",
      Value: Number(categoryPerformance?.gross_profit ?? 0),
    },
    {
      Metric: "Gross Margin (%)",
      Value: Number(categoryPerformance?.gross_margin_perc ?? 0),
    },
    {
      Metric: "Active Items ",
      Value: Number(categoryAvgOrderValue?.active_items_count ?? 0),
    },
    {
      Metric: "Units Sold",
      Value: Number(categoryPerformance?.total_units_sold ?? 0),
    },
  ];

  const sections = [
    {
      title: "Product Performance Key Metrics",
      headers: ["Metric", "Value"],
      data: rows,
    },
  ];

  exportDashboardReportToExcel(
    {
      title: "Product Performance Key Metrics Report",
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
    <div>
      <React.Fragment>
 
       {loading ? (
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
            className="g-2 row-cols-1 row-cols-sm-2 row-cols-md-3  row-cols-lg-4 row-cols-lg-5"
            id="margin-band-widgets"
          >
            <Col className="d-flex">
              <Card className="card-animate w-100 h-80">
                <CardBody className="p-2 d-flex flex-column">
                  <div>
                    <p className="font-medium mb-0">Net Sales</p>
                    <h5 className="mt-2 ff-secondary fw-semibold text-secondary">
                     KES {Number(
                        categoryTotals?.total_sales_excl ?? 0,
                      ).toLocaleString("en-KE")}
                    </h5>
                   <p className="mb-0 text-muted mt-auto">
                    Sales.Incl:
                    <span className="fw-semibold ms-1">
                    KES{" "}
                      {Number(
                        categoryTotals?.total_sales_incl ?? 0,
                      ).toLocaleString("en-KE")}
                    </span>
                  </p>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col className="d-flex">
              <Card className="card-animate w-100 h-80">
                <CardBody className="p-2 d-flex flex-column">
                  <div>
                    <p className="font-medium mb-0">gross Profit</p>
                    <h5 className="mt-2 ff-secondary fw-semibold text-warning">
                       KES {Number(
                        categoryTotals?.gross_profit ?? 0,
                      ).toLocaleString("en-KE")}
                    </h5>
                      <div className="mb-0 mt-auto">                 
                       <p className="text-muted mb-0">
                      Gross Margin:{" "}
                      <span className="fw-semibold">
                        {grossMarginPercentage.toFixed(2)}%
                      </span>
                    </p>                
                  </div>
                  </div>
                </CardBody>
              </Card>
            </Col>

             <Col className="d-flex">
              <Card className="card-animate w-100 h-80">
                <CardBody className="p-2 d-flex flex-column">
                  <div>
                    <p className="font-medium mb-0">Transactions</p>
                    <h5 className="mt-2 ff-secondary fw-semibold text-success">
                     {Number(categoryTotals?.transaction_count ?? 0)}
                    </h5>
                      <div className="mb-0 mt-auto">                 
                       <p className="text-muted mb-0">
                     COGS:{" "}
                      <span className="fw-semibold"> 
                        {Number(categoryTotals?.total_cogs ?? 0)}
                      </span>
                    </p>                
                  </div>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col className="d-flex">
              <Card className="card-animate w-100 h-80">
                <CardBody className="p-2 d-flex flex-column">
                  <div>
                    <p className="font-medium mb-0">Active Items</p>
                    <h5 className="mt-2 ff-secondary fw-semibold text-success">
                     {Number(categoryTotals?.active_items_count ?? 0)}
                    </h5>
                      <div className="mb-0 mt-auto">                 
                       <p className="text-muted mb-0">
                     Line Items:{" "}
                      <span className="fw-semibold"> 
                        {Number(categoryTotals?.total_line_items ?? 0)}
                      </span>
                    </p>                
                  </div>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col className="d-flex">
              <Card className="card-animate w-100 h-80">
                <CardBody className="p-2 d-flex flex-column">
                  <div>
                    <p className="font-medium mb-0">Units Sold</p>
                    <h5 className="mt-2 ff-secondary fw-semibold text-danger">
                      {Number(categoryTotals?.total_units_sold ?? 0)}
                    </h5>
                               <div className="mb-0 mt-auto">                 
                       <p className="text-muted mb-0">
                     Unique Clients:{" "}
                      <span className="fw-semibold"> 
                        {Number(categoryTotals?.total_line_items ?? 0)}
                      </span>
                    </p>                
                  </div>              
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}
      </React.Fragment>
    </div>
  );
};

export default Category;
