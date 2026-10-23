import React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";

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
    },
    {
      name: "New Members",
      members: newCohortMemberCount,
      transactions: newCohortTransactions,
      salesExcl: newCohortSalesExcl,
      salesIncl: newCohortSalesIncl,
      averageBasket: newCohortABV,
      contribution: newCohortSalesContribution,
    },
    {
      name: "Repeat Members",
      members: repeatCohortMemberCount,
      transactions: repeatCohortTransactions,
      salesExcl: repeatCohortSalesExcl,
      salesIncl: repeatCohortSalesIncl,
      averageBasket: repeatCohortABV,
      contribution: repeatCohortSalesContribution,
    },
  ];

  return (
    <React.Fragment>
      <Card className="card-height-100" id="customer-cohort-analysis-card">
        <CardHeader>
        <div>
  <h4 className="card-title mb-1">Customer Analysis</h4>
  <p className="text-muted mb-0 fs-6">
    Customer segments, transaction activity, and sales contribution
  </p>
</div>
        </CardHeader>

        <CardBody>
          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary"
                role="status"
              />
             
            </div>
          ) : error ? (
            <div className="text-center py-5">
              <p className="text-danger mb-0">{error}</p>
            </div>
          ) : (
            <div className="table-responsive table-card">
              <table className="table align-middle table-nowrap mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Cohort</th>
                      <th className="text-end">Members</th>
                  <th className="text-end">Transactions</th>
                  <th className="text-end">Sales Excl. Tax (KES)</th>
                  <th className="text-end">Sales Incl. Tax (KES)</th>
                  <th className="text-end">Average Basket (KES)</th>
                  <th className="text-end">Sales Contribution (%)</th>
                  </tr>
                </thead>

                <tbody>
                {cohorts.map((item) => (
                    <tr key={item.cohort}>
                    <td className="fw-medium">{item.name}</td>

                    <td className="text-end">
                      {item.members || 0}
                    </td>

                    <td className="text-end">
                     {item.transactions || 0}
                    </td>

                    <td className="text-end">
                      {Number(item.salesExcl || 0).toLocaleString("en-KE")}
                    </td>

                    <td className="text-end">
                      {Number(item.salesIncl || 0).toLocaleString("en-KE")}
                    </td>

                    <td className="text-end">
                      {Number(item.averageBasket || 0).toLocaleString("en-KE")}
                    </td>

                    <td className="text-end">
                      {Number(item.contribution).toFixed(1)}%
                    </td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default MemberAnalysis;
