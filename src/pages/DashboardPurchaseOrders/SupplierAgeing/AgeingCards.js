import React from "react";
import { Card, CardBody, Row, Col, CardHeader, } from "reactstrap";
import {  useSelector } from "react-redux";
import {
  exportDashboardReportToExcel,
  triggerPrint,
} from "../../../helpers/export_helper";
const AgeingCards = ({
  // overdueSupplierAccounts = [],
  currentReceivables = 0,
  overdue31To60 = 0,
  overdue61To90 = 0,
  overdue91To120 = 0,
  overdue120Plus = 0,
   selectedBranchName,
   rightClickBtn,
  loading,
  error,
}) => {
    const { startDate, endDate } = useSelector(
        (state) => state.supplierAgeing.filters,
      );

    
  const handleExportExcel = () => {
    const rows = [
      {
        Category: "Aging Summary",
        Supplier: "Current (0-30 days)",
        "Outstanding (KES)": Number(currentReceivables || 0).toLocaleString(
          undefined,
          { minimumFractionDigits: 2 },
        ),
        "Last Invoice": "-",
        "Last Payment": "-",
      },
      {
        Category: "Aging Summary",
        Supplier: "31–60 days",
        "Outstanding (KES)": Number(overdue31To60 || 0).toLocaleString(
          undefined,
          { minimumFractionDigits: 2 },
        ),
        "Last Invoice": "-",
        "Last Payment": "-",
      },
      {
        Category: "Aging Summary",
        Supplier: "61–90 days",
        "Outstanding (KES)": Number(overdue61To90 || 0).toLocaleString(
          undefined,
          { minimumFractionDigits: 2 },
        ),
        "Last Invoice": "-",
        "Last Payment": "-",
      },
      {
        Category: "Aging Summary",
        Supplier: "91–120 days",
        "Outstanding (KES)": Number(overdue91To120 || 0).toLocaleString(
          undefined,
          { minimumFractionDigits: 2 },
        ),
        "Last Invoice": "-",
        "Last Payment": "-",
      },
      {
        Category: "Aging Summary",
        Supplier: "120+ days",
        "Outstanding (KES)": Number(overdue120Plus || 0).toLocaleString(
          undefined,
          { minimumFractionDigits: 2 },
        ),
        "Last Invoice": "-",
        "Last Payment": "-",
      },
      ...(overdueSupplierAccounts || []).map((item) => ({
        Category: "Overdue Supplier Account",
        Supplier: `${item.supplier || ""} (${item.cuscode || ""})`,
        "Outstanding (KES)": Number(item.outstanding || 0).toLocaleString(
          undefined,
          { minimumFractionDigits: 2 },
        ),
        "Last Invoice": item.lastInvoice
          ? new Date(item.lastInvoice).toLocaleDateString("en-GB")
          : "-",
        "Last Payment": item.lastPayment
          ? new Date(item.lastPayment).toLocaleDateString("en-GB")
          : "-",
      })),
    ];
    const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    exportToExcel(rows, `Supplier_Overdue_Invoices_${todayStr}`);
  };
  const handlePrint = () => {
    triggerPrint();
  };
  return (
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
                className="spinner-border text-primary mb-3"
                role="status"
              ></div>
            </div>
          ) : error ? (
            <div className="text-center py-5">
              <h6 className="text-danger mb-2">{error} </h6>
            </div>
          )  : (
            <>
       <Row
  className="g-2 mb-2 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5"
  id="receivables-ageing-widgets"
>
  {/* Current */}
  <Col className="d-flex">
    <Card className="card-animate h-80 w-100">
      <CardBody className="p-2 d-flex flex-column">
        <div>
          <p className="font-medium mb-0">Current</p>
          <h5 className="mt-2 ff-secondary fw-semibold text-success">
            KES {Number(currentReceivables || 0).toLocaleString("en-KE")}
          </h5>
        </div>
        <p className="text-muted mb-0 mt-auto">0–30 days</p>
      </CardBody>
    </Card>
  </Col>

  {/* 31–60 Days */}
  <Col className="d-flex">
    <Card className="card-animate h-80 w-100">
      <CardBody className="p-2 d-flex flex-column">
        <div>
          <p className="font-medium mb-0">31–60 Days</p>
          <h5 className="mt-2 ff-secondary fw-semibold text-warning">
            KES {Number(overdue31To60 || 0).toLocaleString("en-KE")}
          </h5>
        </div>
        <p className="text-muted mb-0 mt-auto">Overdue invoices</p>
      </CardBody>
    </Card>
  </Col>

  {/* 61–90 Days */}
  <Col className="d-flex">
    <Card className="card-animate h-80 w-100">
      <CardBody className="p-2 d-flex flex-column">
        <div>
          <p className="font-medium mb-0">61–90 Days</p>
          <h5 className="mt-2 ff-secondary fw-semibold text-danger">
            KES {Number(overdue61To90 || 0).toLocaleString("en-KE")}
          </h5>
        </div>
        <p className="text-muted mb-0 mt-auto">Overdue invoices</p>
      </CardBody>
    </Card>
  </Col>

  {/* 91–120 Days */}
  <Col className="d-flex">
    <Card className="card-animate h-80 w-100">
      <CardBody className="p-2 d-flex flex-column">
        <div>
          <p className="font-medium mb-0">91–120 Days</p>
          <h5 className="mt-2 ff-secondary fw-semibold text-info">
            KES {Number(overdue91To120 || 0).toLocaleString("en-KE")}
          </h5>
        </div>
        <p className="text-muted mb-0 mt-auto">Overdue invoices</p>
      </CardBody>
    </Card>
  </Col>

  {/* 120+ Days */}
  <Col className="d-flex">
    <Card className="card-animate h-80 w-100">
      <CardBody className="p-2 d-flex flex-column">
        <div>
          <p className="font-medium mb-0">120+ Days</p>
          <h5 className="mt-2 ff-secondary fw-semibold text-danger">
            KES {Number(overdue120Plus || 0).toLocaleString("en-KE")}
          </h5>
        </div>
        <p className="text-muted mb-0 mt-auto">Long overdue invoices</p>
      </CardBody>
    </Card>
  </Col>
</Row>
         
                   
                     </>
                   )}
       
    </React.Fragment>
  );
};

export default AgeingCards;
