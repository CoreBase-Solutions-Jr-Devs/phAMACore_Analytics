import React from 'react';
import { Card, CardBody, CardHeader } from 'reactstrap';
import { salesmanRevenue } from '../../common/data/dashboardEcommerce';

    const SalesmanRevenue = ({ data = [], formatAmount }) => {
  const sorted = [...data]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

    return (
        <React.Fragment>

           <Card className="card-height-100">

  <CardHeader className="align-items-center d-flex">
    <h4 className="card-title mb-0 flex-grow-1">
      Top Salesman — revenue (KES)
    </h4>
  </CardHeader>

  <CardBody>

    {data.length === 0 ? (
      <div className="text-center py-5">
        <p className="text-muted mb-2">
          No salesman revenue data available
        </p>
      </div>
    ) : (

      <div className="table-responsive table-card">
        <table className="table align-middle table-nowrap mb-0">

          <thead>
            <tr className="text-muted">
              <th>Rep</th>
              <th>Branch</th>
              <th>Revenue</th>
              <th className="text-end">Rate</th>
            </tr>
          </thead>

          <tbody>
            {sorted.map((item, i) => (
              <tr key={i}>

                <td className="fw-semibold">
                  {item.rep}
                </td>

                <td className="text-muted">
                  {item.branch}
                </td>

                <td className="fw-medium">
                  {formatAmount(item.revenue)}
                </td>

                <td className="text-end">
                  <span
                    className={`badge rounded-pill bg-${item.rateClass}-subtle text-${item.rateClass} px-3 py-2`}
                  >
                    {item.rate}
                  </span>
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

export default SalesmanRevenue;