import React, { useState } from "react";
import { Card, CardBody, Row, Col } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  exportDashboardReportToExcel,
  triggerPrint,
} from "../../../helpers/export_helper";
const Category = ({
    categoryPerformance,
  selectedBranchName,
  error,
  loading,
  rightClickBtn,
}) => {
   const { branch, dateRange, startDate, endDate } = useSelector(
    (state) => state.powerbi.filters,
);

const handleExportExcel = () => {
  const todayStr = new Date()
    .toLocaleDateString("en-GB")
    .replace(/\//g, "-");

  const fileName = `Product_Performance_Key_Metrics_${todayStr}`;

  const metadata = [
    {
      label: "Report",
      value: "Product Performance Key Metrics",
    },
    {
      label: "Generated Date",
      value: new Date().toLocaleString("en-GB"),
    },
    {
      label: "Selected Branch",
      value: selectedBranchName || "All Branches",
    },
    {
      label: "Date Range Filter",
      value: `${startDate || ""} to ${endDate || ""}`,
    },
  ];

  const rows = [
    {
      Metric: "Total Sales (KES)",
      Value: Number(categoryPerformance?.total_sales_incl ?? 0),
    },
    {
      Metric: "Gross Profit (KES)",
      Value: Number(categoryPerformance?.gross_profit ?? 0),
    },
    {
      Metric: "Units Sold",
      Value: Number(
        categoryPerformance?.total_units_sold ??
        categoryPerformance?.totalUnitsSold ??
        0
      ),
    },
    {
      Metric: "Active Items",
      Value: Number(
        categoryPerformance?.active_items_count ??
        categoryPerformance?.activeItemsCount ??
        0
      ),
    },
  ];

  const sections = [
    {
      title: "Product Performance Key Metrics",
      headers: ["Metric", "Value"],
      data: rows,
    },
  ];

  exportDashboardReportToExcel(
    {
      title: "Product Performance Key Metrics Report",
      metadata,
      sections,
    },
    fileName
  );
};

const handlePrint = () => {
  triggerPrint();
};


  return (
    <div>
      <React.Fragment>
       <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
          <h4 className="card-title mb-0">KEY METRICS</h4>

          <div className="d-flex align-items-center gap-2 ">
            <span>Filtered From:</span>
            <strong>{startDate}</strong> to <strong>{endDate}</strong>
          </div>

          <div className="d-flex align-items-center gap-2 ">
            <span>Selected Branch:</span>
            <strong>{selectedBranchName}</strong>
          </div>

          <div className="d-flex align-items-center gap-2 no-print">
            <button
                  type="button"
                  className="btn btn-soft-success btn-export-excel d-flex align-items-center gap-1"
                  onClick={handleExportExcel}
                  title="Export Key Metrics to Excel"
                >
                  <i className="ri-file-excel-2-line align-bottom"></i>
                  <span>Export Excel</span>
                </button>

            <button
                  type="button"
                  className="btn btn-soft-info btn-export-print d-flex align-items-center gap-1"
                  onClick={handlePrint}
                  title="Print Dashboard"
                >
                  <i className="ri-printer-line align-bottom"></i>
                  <span>Print</span>
                </button>

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
        {loading ? (
  <div className="text-center py-5">
    <div
      className="spinner-border text-primary"
      role="status"
      aria-label="Loading performance metrics"
    >
     
    </div>

   
  </div>
) : error ? (
  <div className="text-center py-5">
    <p className="text-danger mb-0">
      {error}
    </p>
  </div>
) : (
        <Row
          className="g-2 row-cols-1 row-cols-sm-2 row-cols-md-3  row-cols-lg-4"
          id="margin-band-widgets"
        >
          <Col className="d-flex">
            <Card className="card-animate w-100 h-80">
              
              <CardBody className="p-2 d-flex flex-column">
                <div>
                  <p className="font-medium mb-0">Total</p>

                  <h3 className="mt-2 ff-secondary fw-semibold text-secondary">
                    {Number(categoryPerformance?.total_sales_incl ?? 0).toLocaleString(
                      "en-KE",
                    )}
                  </h3>
                    {/* <p className="mb-0 text-muted mt-auto ">
                  Avg basket:
                  <span className="fw-semibold ms-1">
                    KES{" "}
                     {Number(TOTAL?.avg_order_value ?? 0).toLocaleString(
                      "en-KE",
                    )} 
                  </span>
                </p> */}
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col className="d-flex">
            <Card className="card-animate w-100 h-80">
              <CardBody className="p-2 d-flex flex-column">
                <div>
                  <p className="font-medium mb-0">gross Profit</p>

                   <h3 className="mt-2 ff-secondary fw-semibold text-warning">
                    {Number(categoryPerformance?.gross_profit ?? 0).toLocaleString(
                      "en-KE",
                    )}
                  </h3>
                         {/* <p className="mb-0 text-muted mt-auto ">
                  Avg basket:
                  <span className="fw-semibold ms-1">
                    KES{" "}
                    {Number(INSURANCE?.avg_order_value ?? 0).toLocaleString(
                      "en-KE",
                    )}
                  </span>
                </p> */}
                </div>

            
              </CardBody>
            </Card>
          </Col>
          <Col className="d-flex">
            <Card className="card-animate w-100 h-80">
              <CardBody className="p-2 d-flex flex-column">
                <div>
                  <p className="font-medium mb-0">Units Sold</p>

                  <h3 className="mt-2 ff-secondary fw-semibold text-danger">
                    {Number(categoryPerformance?.total_units_sold ?? 0)
                   }
                  </h3>
                </div>

                       {/* <p className="mb-0 text-muted mt-auto ">
                  Avg basket:
                  <span className="fw-semibold ms-1">
                    KES{" "}
                    {Number(OTHER_ACCOUNT?.avg_order_value ?? 0).toLocaleString(
                      "en-KE",
                    )}
                  </span>
                </p> */}
              </CardBody>
            </Card>
          </Col>
            <Col className="d-flex">
            <Card className="card-animate w-100 h-80">
              <CardBody className="p-2 d-flex flex-column">
                <div>
                  <p className="font-medium mb-0">Active Items Count</p>

                  <h3 className="mt-2 ff-secondary fw-semibold text-danger">
                    {Number(categoryPerformance?.active_items_count  ?? 0)}
                  </h3>
                </div>
              
                       {/* <p className="mb-0 text-muted mt-auto ">
                  Avg basket:
                  <span className="fw-semibold ms-1">
                    KES{" "}
                    {Number(RETURN?.avg_order_value ?? 0).toLocaleString(
                      "en-KE",
                    )}
                  </span>
                </p> */}
              </CardBody>
            </Card>
          </Col>
        
        </Row>
        )}
      </React.Fragment>
    </div>
  );
};

export default Category