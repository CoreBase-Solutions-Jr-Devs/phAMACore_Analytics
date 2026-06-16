import React, { useMemo } from "react";
import { Card, CardBody, CardHeader } from "reactstrap";

const RecentOrders = ({ data = [], OverdueAccounts = [] }) => {
  const today = new Date();
const firstOverdue = OverdueAccounts?.[0];
  return (
    <Card className="card-height-100">
      <CardHeader className="align-items-center d-flex">
        <h4 className="card-title mb-0 flex-grow-1">
          OVERDUE INVOICES 
        </h4>
      </CardHeader>
      <CardBody>
        <div className="table-responsive table-card">
          <table className="table table-borderless table-centered table-nowrap mb-0">
            <thead className="text-muted table-light">
              <tr>
                <th>Supplier - Invoice</th>
                <th>Amount</th>
                <th>Due date</th>
                <th>Days overdue</th>
                <th>Terms</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
                {OverdueAccounts.length === 0 ? (
    <tr>
      <td colSpan="6" className="text-center py-5">
        <h6 className="text-muted mb-0">
          No overdue invoices found
        </h6>
      
      </td>
    </tr>
  ) : (
              OverdueAccounts.map((item, key) => (
                <tr key={key} className="mb-0">
                  <td>
                    <div className="fw-medium">
                      {item.supplier}
                      <div className="text-muted fs-12">{item.invoice}</div>
                    </div>
                  </td>

                  <td className="fw-semibold">{item.amount}</td>

                  <td>{item.dueDate}</td>

                  <td className="text-danger">{item.daysOverdueLabel}</td>

                  <td></td>

                  <td>
                    <span
                      className={`badge bg-${item.actionClass}-subtle text-${item.actionClass}`}
                    >
                      {/* {item.action} */}
                    </span>
                  </td>
                </tr>
                ))
  )}

            </tbody>
<tfoot>
  {firstOverdue && (
    <tr>
      <td colSpan="6">
        <div className="text-center ">
          <p className="mb-1 ">
            <strong className="text-danger">{firstOverdue.supplier}</strong> will switch to cash on delivery if not delivered by <strong className="text-danger">{firstOverdue.dueDate}</strong>
          </p>
        </div>
      </td>
    </tr>
  )}
</tfoot>
          </table>
        </div>
      </CardBody>
    </Card>
  );
};

export default RecentOrders;