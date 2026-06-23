import React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";

const ReceivablesAgeing = () => {
  const receivables = [
    {
      customer: "ABC Ltd",
      invoiceNumber: "INV-001",
      invoiceDate: "2026-05-10",
      dueDate: "2026-06-01",
      age: 35,
      amount: 120000,
      paidAmount: 50000,
      balance: 70000,
      status: "30-60",
      risk: "Medium",
      riskColor: "warning",
    },
    {
      customer: "XYZ Hospital",
      invoiceNumber: "INV-002",
      invoiceDate: "2026-04-15",
      dueDate: "2026-05-15",
      age: 75,
      amount: 200000,
      paidAmount: 150000,
      balance: 50000,
      status: "60-90",
      risk: "High",
      riskColor: "danger",
    },
     {
    customer: "City Medical Center",
    invoiceNumber: "INV-003",
    invoiceDate: "2026-06-01",
    dueDate: "2026-06-20",
    age: 20,
    amount: 90000,
    paidAmount: 30000,
    balance: 60000,
    status: "0-30",
    risk: "Low",
    riskColor: "success",
  },
  {
    customer: "Goodlife Pharmacy",
    invoiceNumber: "INV-004",
    invoiceDate: "2026-03-25",
    dueDate: "2026-04-25",
    age: 95,
    amount: 250000,
    paidAmount: 100000,
    balance: 150000,
    status: "90+",
    risk: "High",
    riskColor: "danger",
  },
  {
    customer: "Nairobi General Hospital",
    invoiceNumber: "INV-005",
    invoiceDate: "2026-05-20",
    dueDate: "2026-06-10",
    age: 40,
    amount: 150000,
    paidAmount: 120000,
    balance: 30000,
    status: "30-60",
    risk: "Medium",
    riskColor: "warning",
  },
  ];
  
  return (
      <Card className="card-height-100">
         <CardHeader className="align-items-center d-flex">
           <h4 className="card-title mb-0 flex-grow-1">Receivables / Debtors (Cash Risk Table)        </h4>
              </CardHeader>
              <CardBody>
     <div className="table-responsive table-card">
  <table className="table table-borderless table-centered table-nowrap mb-0">
    <thead className="text-muted table-light">
      <tr>
        <th>Customer</th>
        <th>Invoice</th>
        <th>Due Date</th>
        <th>Days</th>
        <th>Bal(KES)</th>
        <th>Status</th>
        <th>Risk</th>
      </tr>
    </thead>

    <tbody>
      {receivables.length === 0 ? (
        <tr>
          <td colSpan="7" className="text-center py-5">
            <h6 className="text-muted mb-0">No receivables found</h6>
          </td>
        </tr>
      ) : (
        receivables.map((item, index) => (
          <tr key={index}>
            <td className="fw-medium">{item.customer}</td>

            <td className="text-muted fs-12">
              {item.invoiceNumber}
            </td>

            <td>{item.dueDate}</td>

            <td>{item.age}</td>

            <td className="fw-semibold">
{`${Math.round(item.balance / 1000)}K`}         
   </td>

            <td>
              <span className="badge bg-info-subtle text-info">
                {item.status}
              </span>
            </td>

            <td>
              <span
                className={`badge bg-${item.riskColor}-subtle text-${item.riskColor}`}
              >
                {item.risk}
              </span>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>
    </CardBody>
       </Card>
  );
};

export default ReceivablesAgeing;