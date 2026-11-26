import React from "react";
import FeatherIcon from "feather-icons-react";
import { Card, CardBody, Col, Row } from "reactstrap";
import { useSelector } from "react-redux";
import {
  exportDashboardReportToExcel,
  triggerPrint,
} from "../../helpers/export_helper";

const Widgets = ({
  purchaseSummary = {},
  ConsolidatedLPOReviewSummaryData = {},
  leadTimeSummary = {},
  formatAmount,
  totalSpend = 0,
  activeSuppliers = 0,
  priceAlertSummary = {},
  maverickSpendSummary = {},
  maverickSpendPercentage = 0,
  rightClickBtn,
  selectedBranchName,
  error,
  loading,
}) => {
  const { startDate, endDate } = useSelector(
    (state) => state.PurchaseOrders.filters,
  );
  const purchaseData = purchaseSummary || {};
  const ConsolidatedLPOReview = ConsolidatedLPOReviewSummaryData || {};
  const leadTimeSummaryData = leadTimeSummary || {};
  const priceAlertSummaryData = priceAlertSummary || {};
  const maverickSpendSummaryData = maverickSpendSummary || {};
  const formatDisplay = (date) => date || "";

  const handleExportExcel = () => {
    const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    const fileName = `Purchases_Dashboard_Analytics_${todayStr}`;

    const metadata = [
      { label: "Report", value: "Purchase Orders Dashboard Key Metrics" },
      { label: "Generated Date", value: new Date().toLocaleString("en-GB") },
      {
        label: "Date Range Filter",
        value: `${startDate || ""} to ${endDate || ""}`,
      },
    ];

    // const kpiMetricsRows = [
    //   {
    //     Metric: "Total Spend",
    //     Value:
    //       typeof formatAmount === "function"
    //         ? formatAmount(purchaseData.gross_purchases_excl)
    //         : Number(purchaseData.gross_purchases_excl || 0).toLocaleString(),
    //     Notes: "Tax inclusive",
    //   },
    //   {
    //     Metric: "Active Suppliers",
    //     Value: activeSuppliers,
    //     Notes: "Suppliers with orders",
    //   },
    //   {
    //     Metric: "Price Alerts",
    //     Value: priceAlerts,
    //     Notes: "Items with price increase",
    //   },
    //   {
    //     Metric: "Maverick Spend",
    //     Value:
    //       typeof formatAmount === "function"
    //         ? formatAmount(maverickSpend)
    //         : Number(maverickSpend || 0).toLocaleString(),
    //     Notes: `${maverickSpendPercentage}% of spend`,
    //   },
    //   {
    //     Metric: "Avg Lead Time",
    //     Value: `${avgLeadTime} days`,
    //     Notes: "Order to delivery",
    //   },
    // ];

    const sections = [
      {
        title: "Key Purchases Metrics",
        headers: ["Metric", "Value", "Notes"],
        data: kpiMetricsRows,
      },
    ];

    exportDashboardReportToExcel(
      {
        title: "Purchase Orders Analytics Report",
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
              aria-label="Loading category metrics"
            ></div>
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <p className="text-danger mb-0">{error}</p>
          </div>
        ) : (
      <Row
        className="g-2 mb-2 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-6 mt-0"
        id="purchases-kpi-widgets"
      >
        <Col className="d-flex">
          <Card className="card-animate h-80 w-100">
            <CardBody className="p-2 d-flex flex-column">
              <div>
                <p className=" font-medium mb-0">Total Spend</p>
                <h5 className="mt-2 ff-secondary fw-semibold text-success">
                  <span className="counter-value">
                    KES{" "}
                    {Number(
                      purchaseData.gross_purchases_excl || 0,
                    ).toLocaleString("en-KE")}
                  </span>
                </h5>
              </div>
              <div className="mb-0 mt-auto">
                <p className="text-muted mb-0">
                  Net Spend:{" "}
                  <span className="fw-semibold">
                    KES{" "}
                    {Number(
                      purchaseData.net_purchases_incl || 0,
                    ).toLocaleString("en-KE")}
                  </span>
                </p>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col className="d-flex">
          <Card className="card-animate h-80 w-100">
            <CardBody className="p-2 d-flex flex-column">
              <div>
                <p className=" font-medium mb-0">Total LPO Value</p>
                <h5 className="mt-2 ff-secondary fw-semibold text-success">
                  <span className="counter-value">
                    KES{" "}
                    {Number(
                      ConsolidatedLPOReview.total_value_kes || 0,
                    ).toLocaleString("en-KE")}
                  </span>
                </h5>
              </div>
              <p className="text-muted mb-0 mt-auto">Ordered from suppliers</p>
            </CardBody>
          </Card>
        </Col>

        <Col className="d-flex">
          <Card className="card-animate h-80 w-100">
            <CardBody className="p-2 d-flex flex-column">
              <div>
                <p className=" font-medium mb-0">Suppliers</p>

                <h5 className="mt-2 ff-secondary fw-semibold text-info">
                  {Number(purchaseData.unique_suppliers || 0)}
                </h5>
              </div>
              <div className="mb-0 mt-auto">
                <p className="text-muted mb-0">
                  Total Items:{" "}
                  <span className="fw-semibold">
                    {Number(purchaseData.unique_items || 0).toLocaleString(
                      "en-KE",
                    )}
                  </span>
                </p>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col className="d-flex">
          <Card className="card-animate h-80 w-100">
            <CardBody className="p-2 d-flex flex-column">
              <div>
                <p className=" font-medium mb-0">Price Alerts</p>

                <h5 className="mt-2 ff-secondary fw-semibold text-danger">
                  {Number(priceAlertSummaryData.alert_items_count || 0)}
                </h5>
              </div>
              <div className="mb-0 mt-auto">
                <p className="text-muted mb-0">
                  Items Tracked:{" "}
                  <span className="fw-semibold">
                    {Number(
                      priceAlertSummaryData.total_items_with_history || 0,
                    ).toLocaleString("en-KE")}
                  </span>
                </p>
              </div>{" "}
            </CardBody>
          </Card>
        </Col>

        <Col className="d-flex">
          <Card className="card-animate h-80 w-100">
            <CardBody className="p-2 d-flex flex-column">
              <div>
                <p className="font-medium mb-0">Maverick Spend</p>

                <h5 className="mt-2 ff-secondary fw-semibold text-warning">
                  KES{" "}
                  {Number(
                    maverickSpendSummaryData.maverick_off_po_spend || 0,
                  ).toLocaleString("en-KE")}
                </h5>
              </div>
              <div className="mb-0 mt-auto">
                <p className="text-muted mb-0">
                  Off-PO invoices:{" "}
                  <span className="fw-semibold">
                    {Number(
                      maverickSpendSummaryData.off_po_maverick_invoices_count ||
                        0,
                    ).toLocaleString("en-KE")}
                  </span>
                </p>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col className="d-flex">
          <Card className="card-animate h-80 w-100">
            <CardBody className="p-2 d-flex flex-column">
              <div>
                <p className="font-medium mb-0">Avg Lead Time</p>

                <h5 className="mt-2 ff-secondary fw-semibold text-success">
                  {Number(leadTimeSummaryData.avg_lead_time_days || 0).toFixed(
                    1,
                  )}{" "}
                  days
                </h5>
              </div>

              <div className="mb-0 mt-auto">
                <p className="text-muted mb-0">
                  Rate:{" "}
                  <span className="fw-semibold">
                    {`${Number(
                      leadTimeSummaryData.on_time_delivery_rate_perc || 0,
                    ).toFixed(2)}%`}
                  </span>
                </p>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
          )}
    </React.Fragment>
  );
};

export default Widgets;
