import React, { useState } from "react";
import { Card, CardBody, Row, Col } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  exportDashboardReportToExcel,
  triggerPrint,
} from "../../../helpers/export_helper";
const Customer = ({
  totalActiveMembers,
  newMembersOnboarded,
  returningMembers,
  newMemberTransactions,
  newMemberSales,
  newMemberABV,
  repeatMemberTransactions,
  repeatMemberSales,
  repeatMemberABV,
  totalStoreTransactions,
  totalStoreSales,
  overallAverageBasketValue,
  memberTransactionShare,
  memberActionInsight,
  selectedBranchName,
  error,
  loading,
  rightClickBtn,
}) => {
  const { branch, dateRange, startDate, endDate } = useSelector(
    (state) => state.customerMemberAnalysis.filters,
  );
  const handleExportExcel = () => {
  const todayStr = new Date()
    .toLocaleDateString("en-GB")
    .replace(/\//g, "-");

  const metadata = [
    {
      label: "Report",
      value: "Customer Member Analysis",
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
      "Key Metric": "Total Members",
      "Member Count": Number(totalActiveMembers ?? 0),
      "Transactions": Number(totalStoreTransactions ?? 0),
      "Sales (KES)": Number(totalStoreSales ?? 0),
      "Average Basket Value (KES)": Number(overallAverageBasketValue ?? 0),
    },
    {
      "Key Metric": "New Members",
      "Member Count": Number(newMembersOnboarded ?? 0),
      "Transactions": Number(newMemberTransactions ?? 0),
      "Sales (KES)": Number(newMemberSales ?? 0),
      "Average Basket Value (KES)": Number(newMemberABV ?? 0),
    },
    {
      "Key Metric": "Returning Members",
      "Member Count": Number(returningMembers ?? 0),
      "Transactions": Number(repeatMemberTransactions ?? 0),
      "Sales (KES)": Number(repeatMemberSales ?? 0),
      "Average Basket Value (KES)": Number(repeatMemberABV ?? 0),
    },
  ];

  const sections = [
    {
      title: "Customer Membership Key Metrics",
      headers: [
        "Key Metric",
        "Member Count",
        "Transactions",
        "Sales (KES)",
        "Average Basket Value (KES)",
      ],
      data: rows,
    },
    {
      title: "Member Transaction Share",
      headers: ["Metric", "Value"],
      data: [
        {
          Metric: "Member Transaction Share (%)",
          Value: Number(memberTransactionShare ?? 0),
        },
      ],
    },
  ];

  // Include the action insight when available.
  if (memberActionInsight) {
    sections.push({
      title: "Member Action Insight",
      headers: ["Insight"],
      data: [
        {
          Insight:
            typeof memberActionInsight === "string"
              ? memberActionInsight
              : JSON.stringify(memberActionInsight),
        },
      ],
    });
  }

  exportDashboardReportToExcel(
    {
      title: "Customer Member Analysis Report",
      metadata,
      sections,
    },
    `Customer_Member_Analysis_${todayStr}`,
  );
};

const handlePrint = () => {
  triggerPrint();
};
  return (
    <div>
      <React.Fragment>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
          <h4 className="card-title mb-0">KEY METRICS</h4>

          <div className="d-flex align-items-center gap-2 ">
            <span>Filtered From:</span>
            <strong>{startDate}</strong> to <strong>{endDate}</strong>
          </div>

          <div className="d-flex align-items-center gap-2 ">
            <span>Selected Branch:</span>
            <strong>{selectedBranchName}</strong>
          </div>

          <div className="d-flex align-items-center gap-2 no-print">
            <button
                  type="button"
                  className="btn btn-soft-success btn-export-excel d-flex align-items-center gap-1"
                  onClick={handleExportExcel}
                  title="Export Key Metrics to Excel"
                >
                  <i className="ri-file-excel-2-line align-bottom"></i>
                  <span>Export Excel</span>
                </button>

            <button
                  type="button"
                  className="btn btn-soft-info btn-export-print d-flex align-items-center gap-1"
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
                {loading ? (
  <div className="text-center py-5">
    <div
      className="spinner-border text-primary"
      role="status"
      aria-label="Loading performance metrics"
    >
     
    </div>

   
  </div>
) : error ? (
  <div className="text-center py-5">
    <p className="text-danger mb-0">
      {error}
    </p>
  </div>
) : (
        <Row
          className="g-2 row-cols-1 row-cols-sm-2 row-cols-lg-3"
          id="margin-band-widgets"
        >
          <Col className="d-flex">
            <Card className="card-animate w-100 h-80">
              <CardBody className="p-2 d-flex flex-column">
                <div>
                  <p className="font-medium mb-0">Total Members</p>

                  <h3 className="mt-2 ff-secondary fw-semibold text-secondary">
                    {Number(totalActiveMembers || 0)}
                  </h3>
                </div>

                <p className="mb-0 text-muted mt-auto ">
                  Avg basket:
                  <span className="fw-semibold ms-1">
                    KES{" "}
                    {Number(overallAverageBasketValue || 0).toLocaleString(
                      "en-KE",
                    )}
                  </span>
                </p>
              </CardBody>
            </Card>
          </Col>

          <Col className="d-flex">
            <Card className="card-animate w-100 h-80">
              <CardBody className="p-2 d-flex flex-column">
                <div>
                  <p className="font-medium mb-0">New Members</p>

                  <h3 className="mt-2 ff-secondary fw-semibold text-warning">
                    {Number(newMembersOnboarded || 0)}
                  </h3>
                </div>

                <p className="mb-0 text-muted mt-auto">
                  Avg basket:
                  <span className="fw-semibold  ms-1">
                    KES {Number(newMemberABV || 0).toLocaleString("en-KE")}
                  </span>
                </p>
              </CardBody>
            </Card>
          </Col>
          <Col className="d-flex">
            <Card className="card-animate w-100 h-80">
              <CardBody className="p-2 d-flex flex-column">
                <div>
                  <p className="font-medium mb-0">Returning Members</p>

                  <h3 className="mt-2 ff-secondary fw-semibold text-danger">
                    {Number(returningMembers || 0)}
                  </h3>
                </div>

                <p className="mb-0 text-muted mt-auto">
                  Avg basket:
                  <span className="fw-semibold ms-1">
                    KES {Number(repeatMemberABV || 0).toLocaleString("en-KE")}
                  </span>
                </p>
              </CardBody>
            </Card>
          </Col>
        </Row>
          )}
      </React.Fragment>
    </div>
  );
};

export default Customer;
