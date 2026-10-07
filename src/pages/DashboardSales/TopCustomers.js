import React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import { topCustomers } from "../../common/data/dashboardEcommerce";
import { exportToExcel } from "../../helpers/export_helper";
import CardExportButtons from "../../Components/Common/CardExportButtons";

const TopCustomers = ({ data = [], loading, error }) => {
  const sorted = [...data].sort((a, b) => b.revenue - a.revenue);

  const handleExportExcel = () => {
    const rows = (data || []).map((item) => ({
      Customer: item.name || "",
      Branch: item.branch || "",
      "Revenue (KES)": Number(item.revenue || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
      }),
    }));
    const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    exportToExcel(rows, `Top_Customers_Revenue_${todayStr}`);
  };

  return (
    <React.Fragment>
      <Card className="card-height-100" id="sales-top-customers-card">
        <CardHeader className="align-items-center d-flex justify-content-between flex-wrap gap-2">
          <h4 className="card-title mb-0 flex-grow-1">
            Top Customers — revenue (KES)
          </h4>
          <CardExportButtons
            targetId="sales-top-customers-card"
            title="Top Customers"
            onExport={handleExportExcel}
          />
        </CardHeader>

        <CardBody>
          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary mb-3"
                role="status"
              ></div>
            </div>
          ) : error ? (
            <div className="text-center py-5">
              <h6 className="text-danger mb-2">{error} </h6>
            </div>
          ) : data.length === 0 ? (
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
                    <th>Revenue (KES)</th>
                    {/* <th className="text-end">Rate</th> */}
                  </tr>
                </thead>

                <tbody>
                  {sorted.map((item, i) => (
                    <tr key={i}>
                      <td>{item.name}</td>

                      <td className="text-muted font-semibold">
                        {item.branch}
                      </td>

                      <td>{Number(item.revenue).toLocaleString("en-KE")}</td>

                      {/* <td className="text-end">
                        <span
                          className={`badge rounded-pill bg-${item.rateClass}-subtle text-${item.rateClass} px-3 py-2`}
                        >
                          {item.rate}
                        </span>
                      </td> */}
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
