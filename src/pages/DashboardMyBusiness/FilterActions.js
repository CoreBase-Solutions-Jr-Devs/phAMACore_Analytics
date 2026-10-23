import React, { useEffect, useState } from "react";
import { Offcanvas, OffcanvasHeader, OffcanvasBody } from "reactstrap";
import Flatpickr from "react-flatpickr";
import { useDispatch, useSelector } from "react-redux";

import {
  setBranch,
  setDateRange,
  setStartDate,
  setEndDate,
} from "../../slices/dashboardMyBusiness/reducer";
import {
  getCachedBranchesMap,
  saveCachedBranches,
  cleanBranchName,
} from "../../helpers/branch_helper";
import { getBranches } from "../../helpers/fakebackend_helper";
import { DEFAULT_DATE_RANGE } from "../utils/dateHelper";

const dateOptions = ["Today","Yesterday","Last 7 Days","This Week","Last Week","This Month","Month to Date","Last Month","This Year","Year To Date","Custom"];

const FilterActions = ({ onApply, rightColumn, hideRightColumn }) => {
  const dispatch = useDispatch();

  const {
    filters: { branch, dateRange, startDate, endDate },
  } = useSelector(
    (state) => state.DashboardMyBusiness || state.MyBusiness || { filters: {} }
  );

  const [branchesList, setBranchesList] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const cached = getCachedBranchesMap();
    if (cached && Object.keys(cached).length > 0) {
      setBranchesList(
        Object.entries(cached).map(([code, name]) => ({
          branchCode: Number(code),
          branchName: cleanBranchName(name),
        }))
      );
    }

    getBranches({ clientid: 1 })
      .then((res) => {
        const list = res?.data?.result || res?.data || res?.result || res || [];
        if (Array.isArray(list) && list.length > 0 && isMounted) {
          const formatted = list.map((b) => ({
            branchCode: b.bcode ?? b.branchCode ?? b.branch_ID,
            branchName: cleanBranchName(b.brancH_NAME ?? b.branchName ?? b.branch_name),
          }));
          setBranchesList(formatted);
          saveCachedBranches(formatted);
        }
      })
      .catch((err) => {
        console.error("Error fetching branches for MyBusiness FilterActions:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const isCustom = dateRange === "Custom";

  const handleDateChange = (type, selectedDates) => {
    if (!selectedDates?.length) return;
    const formatted = selectedDates[0].toLocaleDateString("en-GB");
    dispatch(setDateRange("Custom"));
    if (type === "startDate") dispatch(setStartDate(formatted));
    if (type === "endDate") dispatch(setEndDate(formatted));
  };

  const handleReset = () => {
    dispatch(setBranch(null));
    dispatch(setDateRange(DEFAULT_DATE_RANGE));
  };

  const pickerProps = {
    className: `form-control ${isCustom ? "" : "bg-light text-primary"}`,
    options: { dateFormat: "d/m/Y", allowInput: isCustom, clickOpens: isCustom },
    readOnly: !isCustom,
  };

  return (
    <Offcanvas
      isOpen={rightColumn}
      toggle={hideRightColumn}
      direction="end"
      style={{ width: 360 }}
    >
      <OffcanvasHeader toggle={hideRightColumn} className="border-bottom">
        Filter Actions
      </OffcanvasHeader>

      <OffcanvasBody>
        <div className="row mb-3 align-items-center">
          <label className="col-4 col-form-label">Branch</label>
          <div className="col-8">
            <select
              className="form-select"
              value={branch ?? ""}
              onChange={(e) =>
                dispatch(setBranch(e.target.value === "" ? null : Number(e.target.value)))
              }
            >
              <option value="">All Branches</option>
              {branchesList.map((b) => (
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
              className="form-select"
              value={dateRange}
              onChange={(e) => dispatch(setDateRange(e.target.value))}
            >
              {dateOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="row mb-3 align-items-center">
          <label className="col-4 col-form-label">Start Date</label>
          <div className="col-8">
            <Flatpickr
              {...pickerProps}
              value={startDate}
              onChange={(dates) => handleDateChange("startDate", dates)}
            />
          </div>
        </div>

        <div className="row mb-3 align-items-center">
          <label className="col-4 col-form-label">End Date</label>
          <div className="col-8">
            <Flatpickr
              {...pickerProps}
              value={endDate}
              onChange={(dates) => handleDateChange("endDate", dates)}
            />
          </div>
        </div>

        <hr className="mb-2 mt-3" />

        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-success" onClick={onApply}>Select</button>
          <button className="btn btn-warning" onClick={handleReset}>Reset</button>
          <button className="btn btn-danger" onClick={hideRightColumn}>Close</button>
        </div>
      </OffcanvasBody>
    </Offcanvas>
  );
};

export default FilterActions;