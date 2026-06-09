import React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import { topCustomers } from "../../../common/data/dashboardEcommerce";
const TopCustomers = ({ data = [], formatAmount }) => {

  const sorted = [...data].sort((a, b) => b.revenue - a.revenue);
  // const shortenName = (name, max = 10) => {
  //   if (!name) return "";
  //   return name.length > max ? name.slice(0, max) + "..." : name;
  // };
  return (
    <React.Fragment>
      <Card className="card-height-100">
        <CardHeader className="align-items-center d-flex">
          <h4 className="card-title mb-0 flex-grow-1">
            Top Customers — revenue (KES)
                        

          </h4>
        </CardHeader>

        <CardBody>
          {data.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted mb-2">
                No customer revenue data available
              </p>
            </div>
          ) : (
            <div className="table-responsive table-card">
              <table className="table align-middle table-nowrap mb-0">
                <thead className="table-light">
                  <tr className="text-muted">
                    <th>Name</th>
                    <th>Branch</th>
                    <th>Revenue</th>
                    <th className="text-end">Rate</th>
                  </tr>
                </thead>

                <tbody>
                  {sorted.map((item, i) => (
                    <tr key={i}>
                      <td >
                        {item.name}
                      </td>

                      <td className="text-muted font-semibold">{item.branch}</td>

                      <td >
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

export default TopCustomers;
