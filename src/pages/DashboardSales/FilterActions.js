import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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

const FilterActions = ({ onApply, rightColumn, hideRightColumn }) => {
    const navigate = useNavigate();

  const dispatch = useDispatch();
  const startRef = useRef(null);
const endRef = useRef(null);
const {
  sales,
  // branches,
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

  const selectedBranchName =
  branches.find(b => b.branchCode === branch)?.branchName || "All Branches";
  
  const dateOptions = ["Today", "Yesterday", "This Week", "Last Week", "This Month" , "Last Month", "This Year", "Last Year", "Custom"];
  
const formatDisplay = (date) => date || "";

  return (
       <React.Fragment>
             <div className={rightColumn ? "layout-rightside-col d-block" : " layout-rightside-col d-none"} id="layout-rightside-coll">
            <div className="overlay" onClick={hideRightColumn}></div>
          <div className="layout-rightside h-100">
                   <Card className="h-100 card-animate">
                     <CardHeader className="py-2">
        <h4 className="card-title mb-0">Filter Actions </h4>
      </CardHeader>

  
  <CardBody className="d-flex flex-column h-100">
   <div className="containerFluid">
  <div className="row mb-3 align-items-center">
            <label className="col-4 col-form-label">Branch</label>
              <div className="col-8">
            <select
              className="form-select "
              value={branch ?? ""}
                onChange={(e) => {
                                    const value = e.target.value;
     dispatch(setBranch(value === "" ? null : Number(value)));
                                    // navigate(`/Dashboard-Analytics/${branchId}`);
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
</div>

<div className="row mb-3 align-items-center">
  <label className="col-4 col-form-label">End Date</label>
  <div className="col-8">
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
        <div className="d-flex justify-content-end mb-2" >
                  <button className="btn btn-success me-2" onClick={onApply}>
                Select
              </button>
                <button className="btn btn-danger " onClick={hideRightColumn}>
                Close
              </button>
        </div>
      </div>
        {/* <div className="d-flex flex-wrap align-items-center justify-content-between small ">
          <div className="row w-100 align-items-center mx-0">
            <div className="col-md-4 d-flex align-items-center gap-1">
              <span className="font-muted">Selected Branch:</span> <strong>{selectedBranchName}</strong>
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
        </div> */}
      </CardBody>
    </Card>
    </div>
          </div>
          </React.Fragment>
  );
};

export default FilterActions;
