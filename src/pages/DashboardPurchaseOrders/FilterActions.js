import React, { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, CardHeader, Row } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  setBranch,
  setDateRange,
  setStartDate,
  setEndDate,
  setTopN,
} from "../../slices/dashboardPurchase/reducer";
import { useRef } from "react";
import Flatpickr from "react-flatpickr";
import { useNavigate } from "react-router-dom";

const FilterActions = ({ onApply, rightColumn, hideRightColumn }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const startRef = useRef(null);
  const endRef = useRef(null);
  const {
    PurchaseOrders,
    kpiPurchases,
    loading,
    error,
    filters: { branch, dateRange, startDate, endDate,  topN },
  } = useSelector((state) => state.PurchaseOrders);

  const branches = (() => {
    const map = {};

    (PurchaseOrders || []).forEach((item) => {
      const code = item.branch_ID;
      const name = item.branch_name;

      if (code == null) return;

      map[code] = {
        branchCode: code,
        branchName: name,
      };
    });
    return Object.values(map);
  })();

  const selectedBranch =
    branches.find((b) => b.branchCode === branch)?.branchName || "All Branches";

 const dateOptions = ["Today", "Yesterday", "This Week", "Last Week", "This Month" , "Last Month", "Month To Date", "This Year", "Year To Date", "Last Year", "Custom"];
  const formatDisplay = (date) => date || "";

  return (
    <React.Fragment>
      <div
        className={
          rightColumn
            ? "layout-rightside-col d-block"
            : " layout-rightside-col d-none"
        }
        id="layout-rightside-coll"
      >
        <div className="overlay" onClick={hideRightColumn}></div>
        <div className="layout-rightside h-100">
          <Card className="h-100 card-animate">
            <CardHeader className="py-2">
              <h4 className="card-title mb-0">Filter Actions </h4>
            </CardHeader>

            <CardBody className="d-flex flex-column h-100">
              <div className="containerFluid">
               

                <div className="row mb-3 align-items-center">
                  <label className="col-4 col-form-label">Date Range</label>
                  <div className="col-8">
                    <select
                      className="form-select "
                      value={dateRange}
                      onChange={(e) => dispatch(setDateRange(e.target.value))}
                    >
                      {dateOptions.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="row mb-3 align-items-center">
                  <label className="col-4 col-form-label">Start Date</label>
                  <div className="col-8">
                    <Flatpickr
                      ref={startRef}
                      options={{
                        dateFormat: "d/m/Y",
                        allowInput: dateRange === "Custom",
                        clickOpens: dateRange === "Custom",
                      }}
                      value={dateRange === "Custom" ? startDate : startDate}
                      onChange={(selectedDates) => {
                        const start = selectedDates[0];
                        dispatch(
                          setStartDate(start.toLocaleDateString("en-GB")),
                        );
                        dispatch(setDateRange("Custom"));
                        if (endRef.current) {
                          endRef.current.flatpickr.set("minDate", start);
                        }
                      }}
                      className={`form-control ${dateRange !== "Custom" ? "bg-light text-primary" : "text-muted"}`}
                      style={{
                        cursor:
                          dateRange !== "Custom" ? "not-allowed" : "pointer",
                      }}
                      placeholder="dd/mm/yyyy"
                      readOnly={dateRange !== "Custom"}
                    />
                  </div>
                </div>
               <div className="row mb-3 align-items-center">
                 <label className="col-4 col-form-label">End Date</label>
                 <div className="col-8">
               <Flatpickr
                 ref={endRef}
                 options={{
                   dateFormat: "d/m/Y",
                   allowInput:
                     dateRange === "Custom" ||
                     dateRange === "Month To Date" ||
                     dateRange === "Year To Date",
               
                   clickOpens:
                     dateRange === "Custom" ||
                     dateRange === "Month To Date" ||
                     dateRange === "Year To Date",
                 }}
                 value={endDate}
                 onChange={(selectedDates) => {
                   const end = selectedDates[0];
               
                   if (!end) return;
               
                   dispatch(
                     setEndDate(end.toLocaleDateString("en-GB"))
                   );
               
                   // Only switch to Custom when the user
                   // is actually using a Custom range.
                   if (dateRange === "Custom") {
                     dispatch(setDateRange("Custom"));
                   }
               
                   if (startRef.current) {
                     startRef.current.flatpickr.set("maxDate", end);
                   }
                 }}
                 className={`form-control ${
                   dateRange !== "Custom" &&
                   dateRange !== "Month To Date" &&
                   dateRange !== "Year To Date"
                     ? "bg-light text-primary"
                     : "text-muted"
                 }`}
                 style={{
                   cursor:
                     dateRange === "Custom" ||
                     dateRange === "Month To Date" ||
                     dateRange === "Year To Date"
                       ? "pointer"
                       : "not-allowed",
                 }}
                 placeholder="dd/mm/yyyy"
                 readOnly={
                   dateRange !== "Custom" &&
                   dateRange !== "Month To Date" &&
                   dateRange !== "Year To Date"
                 }
               />
               </div>
                       </div>

{/* <div className="row mb-3 align-items-center">
  <label className="col-4 col-form-label">Group By</label>

  <div className="col-8">
    <select
      className="form-select"
      value={groupBy}
      onChange={(e) => dispatch(setGroupBy(e.target.value))}
    >
      <option value="SUMMARY">Summary</option>
      <option value="TYPE">Transaction Type</option>
      <option value="BRANCH">Branch</option>
      <option value="SUPPLIER">Supplier</option>
      <option value="CATEGORY">Category</option>
      <option value="MONTHLY">Monthly</option>
    </select>
  </div>
</div> */}

{/* <div className="row mb-3 align-items-center">
  <label className="col-4 col-form-label">Top Numbers</label>
  <div className="col-8">
  <select
    className="form-select"
    value={topN}
    onChange={(e) =>
      dispatch(setTopN(Number(e.target.value)))
    }
  >
    <option value={0}>All</option>
    <option value={5}>Top 5</option>
    <option value={10}>Top 10</option>
    <option value={20}>Top 20</option>
    <option value={50}>Top 50</option>
  </select>
</div>
</div> */}
 <div className="row mb-3 align-items-center">
                  <label className="col-4 col-form-label">Branch</label>
                  <div className="col-8">
                <select
  className="form-select"
  style={{ minWidth: "180px" }}
  value={branch ?? ""}
  onChange={(e) => {
    const value = e.target.value;

    dispatch(setBranch(value === "" ? null : Number(value)));
  }}
>
  <option value="">All Branches</option>

  {branches.map((b) => (
    <option key={b.branchCode} value={b.branchCode}>
      {b.branchName}
    </option>
  ))}
</select>
                  </div>
                </div>

                <hr className="mb-2 mt-3" />
                <div className="d-flex justify-content-end mb-2">
                  <button className="btn btn-success me-2" onClick={onApply}>
                    Select
                  </button>
                  <button className="btn btn-danger " onClick={hideRightColumn}>
                    Close
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </React.Fragment>
  );
};

export default FilterActions;
