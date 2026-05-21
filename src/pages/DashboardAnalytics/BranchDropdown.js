import React, { useEffect, useMemo } from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  setBranch,
  setDateRange,
  setStartDate,
  setEndDate,
} from "../../slices/dashboardSales/reducer";

const BranchDropdown = ({ onApply }) => {
  const dispatch = useDispatch();
  const {
    sales = [],
    loading,
    error,
    filters,
  } = useSelector((state) => state.powerbi);
  const { branch, dateRange, startDate, endDate } = useSelector(
    (state) => state.powerbi.filters,
  );
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
  console.log("🏢 GENERATED BRANCHES:", branches);
  console.log("📦 SALES BEING USED:", sales);
  const dateOptions = ["Today", "Yesterday", "Last 7 Days", "Custom"];
  const formatToInput = (dateStr) => {
    if (!dateStr) return "";

    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  };

  const formatToApi = (dateStr) => {
    if (!dateStr) return "";

    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };
  return (
    <Card>
      <CardHeader className="py-2">
        <h4 className="card-title mb-0">Filter Actions </h4>
      </CardHeader>

      <CardBody>
        <div className="row g-3">
          <div className="col-md-3">
            <label className="text-muted font-semibold">Branch</label>
            <select
              className="form-select text-muted"
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
            <label className="text-muted font-semibold">Date Range</label>
            <select
              className="form-select text-muted"
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
            <label className="text-muted font-semibold">Start Date</label>
            <input
              type="date"
              className="form-control text-muted"
              value={formatToInput(startDate)}
              readOnly={dateRange !== "Custom"}
              onChange={(e) =>
                dispatch(setStartDate(formatToApi(e.target.value)))
              }
            />
          </div>

          <div className="col-md-3">
            <label className="text-muted font-semibold">End Date</label>
            <input
              type="date"
              className="form-control text-muted"
              value={
                dateRange === "Custom"
                  ? formatToInput(startDate || "")
                  : formatToInput(startDate)
              }
              readOnly={dateRange !== "Custom"}
              onChange={(e) =>
                dispatch(setEndDate(formatToApi(e.target.value)))
              }
            />
          </div>
        </div>

        <hr className="mb-2 mt-3" />
        <div className="d-flex flex-wrap align-items-center justify-content-between small text-muted">
          <div className="row w-100 align-items-center mx-0">
            <div className="col-md-4 d-flex align-items-center gap-1">
              <strong>Selected Branch:</strong> <span>{branch}</span>
            </div>
            <div className="col-md-4 d-flex align-items-center gap-1">
              <strong>Filtered From:</strong>
              <span>
                {startDate} to {endDate}
              </span>
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

export default BranchDropdown;
