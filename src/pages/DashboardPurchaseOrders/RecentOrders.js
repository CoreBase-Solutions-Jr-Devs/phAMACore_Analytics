import React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import { exportToExcel } from "../../helpers/export_helper";
import CardExportButtons from "../../Components/Common/CardExportButtons";

const RecentOrders = ({
  overdueSupplierAccounts = [],
  currentReceivables = 0,
  overdue31To60 = 0,
  overdue61To90 = 0,
  overdue91To120 = 0,
  overdue120Plus = 0,
  formatAmount,
}) => {
  const hasAgeingData =
    Number(currentReceivables ?? 0) > 0 ||
    Number(overdue31To60 ?? 0) > 0 ||
    Number(overdue61To90 ?? 0) > 0 ||
    Number(overdue91To120 ?? 0) > 0 ||
    Number(overdue120Plus ?? 0) > 0;

  const handleExportExcel = () => {
    const rows = [
      { Category: "Aging Summary", Supplier: "Current (0-30 days)", "Outstanding (KES)": Number(currentReceivables || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }), "Last Invoice": "-", "Last Payment": "-" },
      { Category: "Aging Summary", Supplier: "31–60 days", "Outstanding (KES)": Number(overdue31To60 || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }), "Last Invoice": "-", "Last Payment": "-" },
      { Category: "Aging Summary", Supplier: "61–90 days", "Outstanding (KES)": Number(overdue61To90 || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }), "Last Invoice": "-", "Last Payment": "-" },
      { Category: "Aging Summary", Supplier: "91–120 days", "Outstanding (KES)": Number(overdue91To120 || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }), "Last Invoice": "-", "Last Payment": "-" },
      { Category: "Aging Summary", Supplier: "120+ days", "Outstanding (KES)": Number(overdue120Plus || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }), "Last Invoice": "-", "Last Payment": "-" },
      ...(overdueSupplierAccounts || []).map((item) => ({
        Category: "Overdue Supplier Account",
        Supplier: `${item.supplier || ""} (${item.cuscode || ""})`,
        "Outstanding (KES)": Number(item.outstanding || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
        "Last Invoice": item.lastInvoice ? new Date(item.lastInvoice).toLocaleDateString("en-GB") : "-",
        "Last Payment": item.lastPayment ? new Date(item.lastPayment).toLocaleDateString("en-GB") : "-",
      })),
    ];
    const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    exportToExcel(rows, `Supplier_Overdue_Invoices_${todayStr}`);
  };

  return (
    <React.Fragment>

    <Card className="card-height-100" id="purchases-overdue-invoices-card">
     <CardHeader className="card-header align-items-center d-flex justify-content-between flex-wrap gap-2">
         <h4 className="card-title mb-0 flex-grow-1">
          Overdue Invoices</h4>
         <CardExportButtons
           targetId="purchases-overdue-invoices-card"
           title="Overdue Invoices"
           onExport={handleExportExcel}
         />
      </CardHeader>

      <CardBody>
        {!hasAgeingData  && overdueSupplierAccounts.length === 0 ? (
          <div className="text-center py-4">
           
            <h6 className="text-muted mb-1">
             
              No receivables ageing data available
            </h6>
          
          </div>
        ) : (
          <>
          <div className="row g-2 mb-3">
            <div className="col-6 col-md-4 col-sm-6">
              <div className="rounded-3 text-center bg-success-subtle p-2">
                <p className="text-success fw-semibold mb-1 small">
                  <small>Current</small>
                </p>

                <h6 className="mb-0 text-success fw-bold">
                  {Number(currentReceivables).toLocaleString("en-KE")}
                </h6>
              </div>
            </div>

            <div className="col-6 col-md-4 col-sm-6">
              <div className="rounded-3 text-center bg-warning-subtle p-2">
                <p className="text-warning fw-semibold mb-1 small">
                  <small>31–60 days</small>
                </p>

                <h6 className="mb-0 text-warning fw-bold">
                  {Number(overdue31To60).toLocaleString("en-KE")}
                </h6>
              </div>
            </div>

            <div className="col-6 col-md-4 col-sm-6">
              <div className="rounded-3 text-center bg-danger-subtle p-2">
                <p className="text-danger fw-semibold mb-1 small">
                  <small>61–90 days</small>
                </p>

                <h6 className="mb-0 text-danger fw-bold">
                  {Number(overdue61To90).toLocaleString("en-KE")}
                </h6>
              </div>
            </div>

            <div className="col-6 col-md-4 col-sm-6">
              <div className="rounded-3 text-center bg-info-subtle p-2">
                <p className="text-info fw-semibold mb-1 small">
                  <small>91–120 days</small>
                </p>

                <h6 className="mb-0 text-info fw-bold">
                  {Number(overdue91To120).toLocaleString("en-KE")}
                </h6>
              </div>
            </div>

            <div className="col-6 col-md-4 col-sm-6">
              <div className="rounded-3 text-center bg-info-subtle p-2">
                <p className="text-info fw-semibold mb-1 small">
                  <small>120+ days</small>
                </p>

                <h6 className="mb-0 text-info fw-bold">
                  {Number(overdue120Plus).toLocaleString("en-KE")}
                </h6>
              </div>
            </div>
          </div>
       
        {/* SUPPLIER TABLE */}
        <div>
          {overdueSupplierAccounts.length === 0 ? (
            <div className="text-center py-4">
              <h6 className="text-muted mb-1">No supplier data available</h6>

            </div>
          ) : (
            <div className="table-responsive table-card">
              <table className="table table-borderless table-centered table-nowrap mb-0">
                <thead className="text-muted table-light">
                  <tr>
                    <th>Supplier-Invoice</th>
                    <th>Outstanding(KES)</th>
                    <th>Last Invoice</th>
                    {/* <th>Ageing</th> */}
                    <th>Last Payment</th>
                    {/* <th>Action</th> */}
                  </tr>
                </thead>

                <tbody>
                  {overdueSupplierAccounts.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="fw-medium">{item.supplier}</div>

                        <div className="text-muted">{item.cuscode}</div>
                      </td>

                      <td>{Number(item.outstanding).toLocaleString("en-KE")}</td>

                      <td>
                        {item.lastInvoice
                          ? new Date(item.lastInvoice).toLocaleDateString(
                              "en-GB",
                            )
                          : "-"}
                      </td>

                      {/* <td>
                        <div className="small">

                          <div>
                            0–30:{" "}
                            {formatAmount(item.ageing.current)}
                          </div>

                          <div>
                            31–60:{" "}
                            {formatAmount(item.ageing.days31To60)}
                          </div>

                          <div>
                            61–90:{" "}
                            {formatAmount(item.ageing.days61To90)}
                          </div>

                          <div>
                            91–120:{" "}
                            {formatAmount(item.ageing.days91To120)}
                          </div>

                          <div>
                            120+:{" "}
                            {formatAmount(item.ageing.over120)}
                          </div>

                        </div>
                      </td> */}

                      <td>
                        {item.lastPayment
                          ? new Date(item.lastPayment).toLocaleDateString(
                              "en-GB",
                            )
                          : "-"}
                      </td>

                      {/* <td>
                        {item.action}
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </>
         )}
      </CardBody>
    </Card>
    </React.Fragment>
  );
};

export default RecentOrders;
