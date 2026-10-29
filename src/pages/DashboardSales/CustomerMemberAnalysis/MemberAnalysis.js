import React from "react";
import { Card, CardBody, CardHeader, Badge } from "reactstrap";
import { exportToExcel, triggerPrint } from "../../../helpers/export_helper";
import CardExportButtons from "../../../Components/Common/CardExportButtons";

const MemberAnalysis = ({
  newCohortMemberCount,
  newCohortTransactions,
  newCohortSalesExcl,
  newCohortSalesIncl,
  newCohortABV,
  newCohortSalesContribution,
  repeatCohortMemberCount,
  repeatCohortTransactions,
  repeatCohortSalesExcl,
  repeatCohortSalesIncl,
  repeatCohortABV,
  repeatCohortSalesContribution,
  nonMemberCount,
  nonMemberTransactions,
  nonMemberSalesExcl,
  nonMemberSalesIncl,
  nonMemberABV,
  nonMemberSalesContribution,
  loading,
  error,
}) => {
  const cohorts = [
    {
      name: "Non-Members",
      members: nonMemberCount,
      transactions: nonMemberTransactions,
      salesExcl: nonMemberSalesExcl,
      salesIncl: nonMemberSalesIncl,
      averageBasket: nonMemberABV,
      contribution: nonMemberSalesContribution,
      badgeColor: "danger",
      label: "Unregistered",
    },
    {
      name: "New Members",
      members: newCohortMemberCount,
      transactions: newCohortTransactions,
      salesExcl: newCohortSalesExcl,
      salesIncl: newCohortSalesIncl,
      averageBasket: newCohortABV,
      contribution: newCohortSalesContribution,
      badgeColor: "secondary",
      label: "First-time",
    },
    {
      name: "Repeat Members",
      members: repeatCohortMemberCount,
      transactions: repeatCohortTransactions,
      salesExcl: repeatCohortSalesExcl,
      salesIncl: repeatCohortSalesIncl,
      averageBasket: repeatCohortABV,
      contribution: repeatCohortSalesContribution,
      badgeColor: "success",
      label: "Returning",
    },
  ];

  const formatNumber = (value) =>
    Number(value ?? 0).toLocaleString("en-KE",);

  const formatContribution = (value) => `${Number(value ?? 0).toFixed(1)}%`;

  const getBadgeColor = (percentage) => {
    if (percentage == null || Number.isNaN(Number(percentage))) {
      return "bg-warning-subtle text-warning";
    }

    // if (percentage < 0) {
    //   return "bg-danger-subtle text-danger";
    // }

    if (percentage < 10) {
      return "bg-danger-subtle text-danger-emphasis";
    }

    if (percentage < 50) {
      return "bg-primary-subtle text-primary-emphasis";
    }
    return "bg-success-subtle text-success";
  };

  const handleExportExcel = () => {
    const rows = cohorts.map((item) => ({
      Cohort: item.name,
      Members: Number(item.members ?? 0),
      Transactions: Number(item.transactions ?? 0),
      "Sales Excl. Tax (KES)": Number(item.salesExcl ?? 0),
      "Sales Incl. Tax (KES)": Number(item.salesIncl ?? 0),
      "Average Basket (KES)": Number(item.averageBasket ?? 0),
      "Sales Contribution (%)": Number(item.contribution ?? 0),
    }));

    const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

    exportToExcel(rows, `Customer_Cohort_Analysis_${todayStr}`);
  };

  // const handlePrint = () => {
  //   triggerPrint();
  // };

  return (
    <Card
      className="card-height-100 border shadow-sm"
      id="customer-cohort-analysis-card"
    >
      <CardHeader className="d-flex justify-content-between align-items-center flex-wrap border-0 pb-0 gap-2">
        <div>
          <h4 className="card-title mb-1">Customer Analysis</h4>
          <p className="text-muted mb-0">
            Customer segments, transaction activity, and sales contribution
          </p>
        </div>

        <CardExportButtons
          targetId="customer-member-card"
          title="Customer Member"
          onExport={handleExportExcel}
        />
      </CardHeader>

      <CardBody>
        {loading ? (
          <div className="text-center py-5">
            <div
              className="spinner-border text-primary"
              role="status"
              aria-label="Loading customer analysis"
            />
            <p className="text-muted mt-2 mb-0">Loading customer analysis...</p>
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <Badge color="danger" className="px-3 py-2 mb-2">
              Unable to load data
            </Badge>
            <p className="text-danger mb-0">{error}</p>
          </div>
        ) : (
          <div className="table-responsive table-card">
            <table className="table table-hover align-middle table-nowrap mb-0">
              <thead className="table-light">
                <tr>
                  {[
                    { label: "Cohort", align: "text-start" },
                    { label: "Members", align: "text-end" },
                    { label: "Transactions", align: "text-end" },
                    {
                      label: "Sales Excl. Tax (KES)",
                      align: "text-end",
                    },
                    {
                      label: "Sales Incl. Tax (KES)",
                      align: "text-end",
                    },
                    {
                      label: "Average Basket (KES)",
                      align: "text-end",
                    },
                    {
                      label: "Sales Contribution",
                      align: "text-end",
                    },
                  ].map((column) => (
                    <th key={column.label} className={`${column.align} py-3`}>
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {cohorts.map((item) => (
                  <tr key={item.name}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span
                          className={getBadgeColor(item.contribution)}
                          style={{
                            width: "4px",
                            height: "38px",
                            borderRadius: "4px",
                            display: "inline-block",
                            flexShrink: 0,
                            padding: 0,
                          }}
                        />

                        <div>
                          <div className="fw-semibold text-dark">
                            {item.name}
                          </div>
                          <Badge
                            pill
                            className={`mt-1 px-2 py-1 ${
                              item.badgeColor === "danger"
                                ? "bg-danger-subtle text-danger"
                                : item.badgeColor === "secondary"
                                  ? "bg-secondary-subtle text-secondary"
                                  : "bg-success-subtle text-success"
                            }`}
                          >
                            {item.label}
                          </Badge>
                        </div>
                      </div>
                    </td>

                    <td className="text-end">
                      <span className="fw-semibold text-dark">
                        {formatNumber(item.members)}
                      </span>
                    </td>

                    <td className="text-end">
                      <span className="text-muted">
                        {formatNumber(item.transactions)}
                      </span>
                    </td>

                    <td className="text-end">
                      <span
                        className="fw-semibold"
                        style={{ color: "#9a6b35" }}
                      >
                        {formatNumber(item.salesExcl)}
                      </span>
                    </td>

                    <td className="text-end">
                      <span className="text-dark">
                        {formatNumber(item.salesIncl)}
                      </span>
                    </td>

                    <td className="text-end">
                      <span className="fw-semibold text-primary">
                        {formatNumber(item.averageBasket)}
                      </span>
                    </td>

                    <td className="text-end">
                      <Badge
                        pill
                        className={getBadgeColor(item.contribution)}
                      >
                        {formatContribution(item.contribution)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default MemberAnalysis;
