import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import { MonthToDateCharts } from "./DashboardEcommerceCharts";
import CountUp from "react-countup";
import { useSelector, useDispatch } from "react-redux";
import { getRevenueChartsData } from "../../slices/thunks";
import { createSelector } from "reselect";
import { exportToExcel } from "../../helpers/export_helper";
import CardExportButtons from "../../Components/Common/CardExportButtons";

const MonthToDatePurchases = ({categories, series, formatAmount}) => {
  const handleExportExcel = () => {
    const rows = (categories || []).map((cat, idx) => {
      const row = { Day: cat };
      (series || []).forEach((s) => {
        row[s.name || "Value"] = Number(s.data?.[idx] || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });
      });
      return row;
    });
    const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    exportToExcel(rows, `Month_To_Date_Purchases_${todayStr}`);
  };

  return (
    <React.Fragment>
      <Card id="purchases-mtd-card">
        <CardHeader className="border-0 align-items-center d-flex justify-content-between flex-wrap gap-2">
          <h4 className="card-title mb-0 flex-grow-1">Month to Date Comparative Purchases Line Graph(MTD) </h4>
          <CardExportButtons
            targetId="purchases-mtd-card"
            title="Month To Date Purchases"
            onExport={handleExportExcel}
          />
        </CardHeader>

        <CardBody className="p-0 pb-2">
          <div className="w-100">
            <div dir="ltr">
              <div className="d-flex justify-content-end align-items-center gap-3 px-3 pt-2">
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
              <MonthToDateCharts categories={categories} series={series} formatAmount={formatAmount} dataColors='["--vz-primary", "--vz-success", "--vz-danger"]' />
            </div>
          </div>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default MonthToDatePurchases;
