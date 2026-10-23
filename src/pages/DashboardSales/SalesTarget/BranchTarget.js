
import React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";

const formatAmount = (value) =>
  Number(value).toLocaleString("en-KE", {
    maximumFractionDigits: 0,
  });

const BranchTarget = ({
  selectedBranchName,
  error,
  loading,
  rightClickBtn,
}) => {
  // Static branch sales and targets
  const branchData = [
    {
      branchID: 1,
      branchName: "Syokimau",
      julySalesIncl: 0,
      julyTarget: 0,
      augustSalesIncl: 0,
      augustTarget: 0,
      septemberSalesIncl: 0,
      septemberTarget: 0,
      octoberSalesIncl: 0,
      octoberTarget: 0,
    },
    {
      branchID: 2,
      branchName: "Tassia",
      julySalesIncl: 0,
      julyTarget: 0,
      augustSalesIncl: 0,
      augustTarget: 0,
      septemberSalesIncl: 0,
      septemberTarget: 0,
      octoberSalesIncl: 0,
      octoberTarget: 0,
    },
    {
      branchID: 3,
      branchName: "Machakos",
      julySalesIncl: 0,
      julyTarget: 0,
      augustSalesIncl: 0,
      augustTarget: 0,
      septemberSalesIncl: 0,
      septemberTarget: 0,
      octoberSalesIncl: 0,
      octoberTarget: 0,
    },
    {
      branchID: 4,
      branchName: "Mtwapa",
      julySalesIncl: 0,
      julyTarget: 0,
      augustSalesIncl: 0,
      augustTarget: 0,
      septemberSalesIncl: 0,
      septemberTarget: 0,
      octoberSalesIncl: 0,
      octoberTarget: 0,
    },
    {
      branchID: 5,
      branchName: "Kasarani",
      julySalesIncl: 0,
      julyTarget: 0,
      augustSalesIncl: 0,
      augustTarget: 0,
      septemberSalesIncl: 0,
      septemberTarget: 0,
      octoberSalesIncl: 0,
      octoberTarget: 0,
    },
    {
      branchID: 6,
      branchName: "Eldoret",
      julySalesIncl: 0,
      julyTarget: 0,
      augustSalesIncl: 0,
      augustTarget: 0,
      septemberSalesIncl: 0,
      septemberTarget: 0,
      octoberSalesIncl: 0,
      octoberTarget: 0,
    },
    {
      branchID: 7,
      branchName: "Busia",
      julySalesIncl: 0,
      julyTarget: 0,
      augustSalesIncl: 0,
      augustTarget: 0,
      septemberSalesIncl: 0,
      septemberTarget: 0,
      octoberSalesIncl: 0,
      octoberTarget: 0,
    },
    {
      branchID: 8,
      branchName: "Msa GPO",
      julySalesIncl: 0,
      julyTarget: 0,
      augustSalesIncl: 0,
      augustTarget: 0,
      septemberSalesIncl: 0,
      septemberTarget: 0,
      octoberSalesIncl: 0,
      octoberTarget: 0,
    },
    {
      branchID: 9,
      branchName: "Kitale",
      julySalesIncl: 0,
      julyTarget: 0,
      augustSalesIncl: 0,
      augustTarget: 0,
      septemberSalesIncl: 0,
      septemberTarget: 0,
      octoberSalesIncl: 0,
      octoberTarget: 0,
    },
    {
      branchID: 10,
      branchName: "Kisii",
      julySalesIncl: 0,
      julyTarget: 0,
      augustSalesIncl: 0,
      augustTarget: 0,
      septemberSalesIncl: 0,
      septemberTarget: 0,
      octoberSalesIncl: 0,
      octoberTarget: 0,
    },
  ];

  const formatMonthlyAmount = (value) =>
    value !== null && value !== undefined && value !== ""
      ? formatAmount(value)
      : "N/A";
   const { branch, dateRange, startDate, endDate } = useSelector(
    (state) => state.powerbi.filters,
);
  return (
    <React.Fragment>
  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
    <h4 className="card-title mb-0">
      {/* Sales Performance Overview */}
      </h4>

          <div className="d-flex align-items-center gap-2 ">
            <span>Filtered From:</span>
            <strong>{startDate}</strong> to <strong>{endDate}</strong>
          </div>

          <div className="d-flex align-items-center gap-2 ">
            <span>Selected Branch:</span>
            <strong>{selectedBranchName}</strong>
          </div>

          <div className="d-flex align-items-center gap-2 no-print">
            {/* <button
                  type="button"
                  className="btn btn-soft-success btn-export-excel d-flex align-items-center gap-1"
                  onClick={handleExportExcel}
                  title="Export Key Metrics to Excel"
                >
                  <i className="ri-file-excel-2-line align-bottom"></i>
                  <span>Export Excel</span>
                </button> */}

            {/* <button
                  type="button"
                  className="btn btn-soft-info btn-export-print d-flex align-items-center gap-1"
                  onClick={handlePrint}
                  title="Print Dashboard"
                >
                  <i className="ri-printer-line align-bottom"></i>
                  <span>Print</span>
                </button> */}

            <button
              type="button"
              className="btn btn-caramel d-flex align-items-center gap-2 layout-rightside-btn"
              onClick={rightClickBtn}
            >
              <i className="ri-filter-fill"></i>
              Filter
            </button>
          </div>
        </div>

      <Card className="card-height-100">

        <CardBody>
          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary"
                role="status"
              />
              <p className="text-muted mt-2 mb-0">
                Loading branch performance...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-5">
              <p className="text-danger mb-0">
                {typeof error === "string"
                  ? error
                  : error.message || "Failed to load branch performance."}
              </p>
            </div>
          ) : (
            <div className="table-responsive table-card">
              <table className="table align-middle table-nowrap mb-0">
   <thead className="table-light">
  <tr>
    <th rowSpan={2} className="align-middle">
      Branch
    </th>

    {/* {[
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ].map((month) => (
      <th key={month} colSpan={4} className="text-center">
        {month}
      </th>
    ))} */}
  </tr>

  <tr>
    {[
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ].map((month) => (
      <React.Fragment key={month}>
        <th className="text-end">{month}_Act</th>
        <th className="text-end">{month}_Tart</th>
        <th className="text-end">{month}_Var</th>
        {/* <th className="text-end">{month}_Pct</th> */}
      </React.Fragment>
    ))}
  </tr>
</thead>

   <tbody>
  {branchData.map((item) => (
    <tr key={item.branchID}>
      <td className="fw-medium">{item.branchName}</td>

      {Array.from({ length: 12 }).map((_, index) => (
        <React.Fragment key={index}>
          <td className="text-end">0</td>
          <td className="text-end">0</td>
          <td className="text-end">0</td>
          <td className="text-end">0%</td>
        </React.Fragment>
      ))}
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

export default BranchTarget;
