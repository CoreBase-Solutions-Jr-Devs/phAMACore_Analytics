import React, { useState, useEffect } from 'react';
import { Card, Col, CardHeader } from 'reactstrap';
import classNames from "classnames";
import { useSelector, useDispatch } from "react-redux";
import { SpendCharts } from './DashboardEcommerceCharts';
import { getAllData } from "../../slices/thunks";
import { createSelector } from 'reselect';
import { exportToExcel } from "../../helpers/export_helper";
import CardExportButtons from "../../Components/Common/CardExportButtons";

const getColor = (percent) => {
  if (percent >= 75) return "bg-success";
  if (percent >= 50) return "bg-primary";
  if (percent >= 30) return "bg-warning";
  return "bg-danger";
};

const SupplierSpend = ({ supplierData, top2Suppliers, formatAmount, totalSpend }) => {
    const hasData =
    Array.isArray(supplierData) &&
    supplierData.length > 0;
const top2Total =
  (top2Suppliers?.[0]?.value || 0) +
  (top2Suppliers?.[1]?.value || 0);
  const top2Percent =
  totalSpend > 0
    ? ((top2Total / totalSpend) * 100).toFixed(1)
    : 0;

  const handleExportExcel = () => {
    const rows = (supplierData || []).map((item) => ({
      Supplier: item.name || "",
      "Spend (KES)": Number(item.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
    }));
    const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    exportToExcel(rows, `Spend_By_Supplier_${todayStr}`);
  };

    return (
        <React.Fragment>
      
                <Card className="card-height-100" id="purchases-top-suppliers-card">

                    <CardHeader className="card-header align-items-center d-flex justify-content-between flex-wrap gap-2">
                        <h4 className="card-title mb-0 flex-grow-1">
                         Spend by Supplier
                        </h4>
                        <CardExportButtons
                          targetId="purchases-top-suppliers-card"
                          title="Spend by Supplier"
                          onExport={handleExportExcel}
                        />
                    </CardHeader>
                    <div className="card-body p-3">
     
                        {!hasData ? (
           <div className="text-center py-5">
          <h6 className="text-muted mb-2">
            No supplier spend data available
            </h6>
          </div>
        ) : (
          <div className="px-2 mt-1">
  {supplierData.map((item) => {
    const maxValue = Math.max(
      ...supplierData.map((d) => d.value),
      1
    );

    const percent = (item.value / maxValue) * 100;
            const color = getColor(percent);

    return (
      <div key={item.name} className="mb-3">
          <div className="d-flex justify-content-between">
                    <span className="text-uppercase"> 
                      {item.name}
                    </span>
  <span className="text-muted">
                KES {Number(item.value).toLocaleString("en-KE")}
          </span>
        </div>

        <div
          className="progress mt-2"
          style={{
            height: "20px",
          }}
        >
          <div
            className={`progress-bar progress-bar-striped ${color}`}
            role="progressbar"
            style={{
              width: `${percent}%`,
            }}
          />
        </div>
      </div>
    );
  })}
  <hr className="my-2" />

{top2Suppliers.length === 2 && (
  <div className="text-center">
    <p className="mb-1">
      <strong>{top2Suppliers[0].name} + {top2Suppliers[1].name}</strong> ={" "}
      {top2Percent}% of total spend
    </p>
    {/* <p className="text-danger small mb-0">
      Concentration is within the safe range (≤ 75%).
    </p> */}
  </div>
)}
</div>

        )}
    

                    </div>

                </Card>
       
        </React.Fragment>
    );
};

export default SupplierSpend;