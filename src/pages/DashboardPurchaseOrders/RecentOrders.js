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
 

            </tbody>
<tfoot>

</tfoot>
          </table>
        </div>
      </CardBody>
    </Card>
  );
};

export default RecentOrders;