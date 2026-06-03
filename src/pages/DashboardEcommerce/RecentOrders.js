import React, { useMemo } from "react";
import { Card, CardBody, CardHeader } from "reactstrap";

const RecentOrders = ({ data = [] }) => {
  const today = new Date();

const rows = useMemo(() => {
  const mapped = (data || []).map((item) => {
    const dueDate = new Date(item.expected_date);

    const daysOverdue = Math.max(
      0,
      Math.floor((today - dueDate) / (1000 * 60 * 60 * 24))
    );

    const amountValue = Number(item.total_lpo_value || 0);

    return {
      supplier: item.supplier_Name || "Unknown",
      invoice: item.lpo_id,
      amountValue, 
      amount: `KES ${amountValue.toLocaleString()}`,
      dueDate: dueDate.toLocaleDateString(),
      daysOverdue,
      daysOverdueLabel: `${daysOverdue} days`,
      terms: item.terms || "Net 30",
      action: daysOverdue > 0 ? "Pay today" : "On track",
      actionClass: daysOverdue > 0 ? "danger" : "success",
    };
  });
  const uniqueMap = new Map();

mapped.forEach((item) => {
  if (!uniqueMap.has(item.supplier)) {
    uniqueMap.set(item.supplier, item);
  }
});

return Array.from(uniqueMap.values())
  .sort((a, b) => b.amountValue - a.amountValue)
  .slice(0,7);
}, [data]);

  return (
    <Card>
      <CardHeader className="align-items-center d-flex">
        <h4 className="card-title mb-0 flex-grow-1">
          OVERDUE INVOICES - ACTION REQUIRED TODAY
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
              {rows.map((item, key) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
};

export default RecentOrders;