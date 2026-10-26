
import React from "react";
import { Card, CardBody, CardHeader, Badge } from "reactstrap";

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
      badgeColor: "secondary",
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
      badgeColor: "info",
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
    Number(value ?? 0).toLocaleString("en-KE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

  const formatContribution = (value) =>
    `${Number(value ?? 0).toFixed(1)}%`;

  const getBadgeColor = (percentage) => {
    if (
      percentage == null ||
      Number.isNaN(Number(percentage))
    ) {
      return "bg-danger-subtle text-danger";
    }

    if (Number(percentage) < 0) {
      return "bg-danger-subtle text-danger";
    }

    if (Number(percentage) < 10) {
      return "bg-warning-subtle text-warning-emphasis";
    }

    return "bg-success-subtle text-success";
  };

  return (
    <Card
      className="card-height-100 border shadow-sm"
      id="customer-cohort-analysis-card"
    >
      <CardHeader className="bg-white border-bottom">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <h4 className="card-title mb-1">
              Customer Analysis
            </h4>
            <p className="text-muted mb-0">
              Customer segments, transaction activity, and sales contribution
            </p>
          </div>
{/* 
          <Badge
            color="light"
            className="text-dark border px-1 py-1"
          >
            {cohorts.length} Cohorts
          </Badge> */}
        </div>
      </CardHeader>

      <CardBody>
        {loading ? (
          <div className="text-center py-5">
            <div
              className="spinner-border text-primary"
              role="status"
              aria-label="Loading customer analysis"
            />
            <p className="text-muted mt-2 mb-0">
              Loading customer analysis...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <Badge
              color="danger"
              className="px-3 py-2 mb-2"
            >
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
                    <th
                      key={column.label}
                      className={`${column.align} py-3`}
                    >
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
    item.badgeColor === "secondary"
      ? "bg-secondary-subtle text-secondary"
      : item.badgeColor === "info"
        ? "bg-info-subtle text-info"
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
                        className={`px-3 py-2 ${getBadgeColor(item.contribution)}`}
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
