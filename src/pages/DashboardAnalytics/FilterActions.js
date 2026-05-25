import React, { useEffect, useMemo } from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  setBranch,
  setDateRange,
  setStartDate,
  setEndDate,
} from "../../slices/dashboardSales/reducer";
import { useRef } from "react";
import Flatpickr from "react-flatpickr";

const FilterActions = ({ onApply }) => {
  const dispatch = useDispatch();
  const startRef = useRef(null);
const endRef = useRef(null);
const {
  sales,
  loading,
  error,
  filters: { branch, dateRange, startDate, endDate },
} = useSelector((state) => state.powerbi);
  
  const branches = (() => {
    const map = {};

    (sales || []).forEach((item) => {
      const code = item.branch_ID;
      const name = item.brancch_Name;

      if (code == null) return;

      map[code] = {
        branchCode: code,
        branchName: name,
      };
    });
    return Object.values(map);
  })();

  
  const dateOptions = ["Today", "Yesterday", "Last 7 Days", "Custom"];
  
const formatDisplay = (date) => date || "";

  return (
    <Card>
      <CardHeader className="py-2">
        <h4 className="card-title mb-0">Filter Actions </h4>
      </CardHeader>

      <CardBody>
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label">Branch</label>
            <select
              className="form-select "
              value={branch || "All"}
              onChange={(e) =>
                dispatch(
                  setBranch(
                    e.target.value === "All" ? null : Number(e.target.value),
                  ),
                )
              }
            >
              <option value="All">All Branches</option>

              {branches.map((b) => (
                <option key={b.branchCode} value={b.branchCode}>
                  {b.branchName}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Date Range</label>
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

        <div className="col-md-3">
  <label className="form-label ">Start Date</label>

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
      dispatch(setStartDate(start.toLocaleDateString("en-GB")) );
      dispatch(setDateRange("Custom"));
      if (endRef.current) {
        endRef.current.flatpickr.set("minDate", start);
      }
    }}
  className={`form-control ${dateRange !== "Custom" ? "bg-light text-primary" : "text-muted"}`}
    style={{ cursor: dateRange !== "Custom" ? "not-allowed" : "pointer" }}
    placeholder="dd/mm/yyyy"
     readOnly={dateRange !== "Custom"}
  />
</div>

       <div className="col-md-3">
  <label className="form-label ">End Date</label>

  <Flatpickr
    ref={endRef}
    options={{
      dateFormat: "d/m/Y",
    allowInput: dateRange === "Custom",
    clickOpens: dateRange === "Custom",
    }}
    value={dateRange === "Custom" ? endDate : endDate}
    onChange={(selectedDates) => {
      const end = selectedDates[0];

      dispatch(setEndDate(end.toLocaleDateString("en-GB")) );
      dispatch(setDateRange("Custom"));
      if (startRef.current) {
        startRef.current.flatpickr.set("maxDate", end);
      }
    }}
     className={`form-control ${dateRange !== "Custom" ? "bg-light text-primary" : "text-muted"}`}
    style={{ cursor: dateRange !== "Custom" ? "not-allowed" : "pointer" }}
  readOnly={dateRange !== "Custom"}
  />
</div>
        </div>

        <hr className="mb-2 mt-3" />
        <div className="d-flex flex-wrap align-items-center justify-content-between small ">
          <div className="row w-100 align-items-center mx-0">
            <div className="col-md-4 d-flex align-items-center gap-1">
              <span className="font-muted">Selected Branch:</span> <strong>{branch}</strong>
            </div>
            <div className="col-md-4 d-flex align-items-center gap-1">
              <span className="font-muted">Filtered From:</span>
              <strong >
                {formatDisplay(startDate)} to {formatDisplay(endDate)}
              </strong>
            </div>
            <div className="col-md-4 d-flex justify-content-md-end gap-2 mt-2 mt-md-0">
              <button className="btn btn-success btn-sm" onClick={onApply}>
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default FilterActions;
