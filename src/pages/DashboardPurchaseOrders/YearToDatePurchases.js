import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import { RevenueCharts } from "./DashboardEcommerceCharts";
import CountUp from "react-countup";
import { useSelector, useDispatch } from "react-redux";
import { getRevenueChartsData } from "../../slices/thunks";
import { createSelector } from "reselect";
import { exportToExcel } from "../../helpers/export_helper";
import CardExportButtons from "../../Components/Common/CardExportButtons";

const YearToDatePurchases = ({categories, series, formatAmount,error, loading}) => {
  const handleExportExcel = () => {
    const rows = (categories || []).map((cat, idx) => {
      const row = { Period: cat };
      (series || []).forEach((s) => {
        row[s.name || "Value"] = Number(s.data?.[idx] || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });
      });
      return row;
    });
    const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    exportToExcel(rows, `Year_To_Date_Purchases_${todayStr}`);
  };

  return (
    <React.Fragment>
      
      <Card id="purchases-ytd-card">
          <CardHeader className="p-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
                     <h6 className="card-title mb-0">
            Year to Date Comparative Line Graph(YTD) </h6>
            <div className="d-flex align-items-center">
          <CardExportButtons
            targetId="purchases-ytd-card"
            title="Year To Date Purchases"
            onExport={handleExportExcel}
          />
          </div>
        </CardHeader>
    {loading ? (
          <div className="text-center py-5">
            <div
              className="spinner-border text-primary"
              role="status"
              aria-label="Loading category metrics"
            ></div>
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <p className="text-danger mb-0">{error}</p>
          </div>
        ) : (
        <CardBody className="pb-2">
<div className="d-flex justify-content-end align-items-center gap-3 px-3 pt-2 pb-1">
  <div className="d-flex align-items-center gap-2">
    <span
      style={{
        display: "inline-block",
        width: "25px",
        borderTop: "3px solid var(--vz-primary)",
      }}
    />
    <span className="text-muted">2026</span>
  </div>

  <div className="d-flex align-items-center gap-2">
    <span
      style={{
        display: "inline-block",
        width: "25px",
        borderTop: "3px dashed var(--vz-primary)",
      }}
    />
    <span className="text-muted">2025</span>
  </div>
</div>
<div className="mt-0 pt-0">
              <RevenueCharts categories={categories} series={series} formatAmount={formatAmount} dataColors='["--vz-primary", "--vz-success", "--vz-danger"]' />            
          </div>
        </CardBody>
          )}
      </Card>
    
    </React.Fragment>
  );
};

export default YearToDatePurchases;
