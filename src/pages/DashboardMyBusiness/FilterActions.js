import React, { useEffect, useState, useMemo, useRef } from "react";
import { Offcanvas, OffcanvasHeader, OffcanvasBody } from "reactstrap";
import Flatpickr from "react-flatpickr";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  resetFilters,
  computeDateRangeValues,
} from "../../slices/dashboardMyBusiness/reducer";
import {
  getCachedBranchesMap,
  saveCachedBranches,
  cleanBranchName,
  saveActiveBranch,
} from "../../helpers/branch_helper";
import { getBranches } from "../../helpers/fakebackend_helper";

const dateOptions = [
  "Today","Yesterday",
  "Month To Date","Month To Yesterday","Last Month",
  "Year To Date","Year To Yesterday","Last Year",
  "Last 7 Days","This Week","Last Week",
  "Custom"
];

const FilterActions = ({ onApply, rightColumn, hideRightColumn }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const appliedFilters = useSelector(
    (state) => (state.DashboardMyBusiness || state.MyBusiness)?.appliedFilters || {}
  );

  // Local draft state so changing selections does not touch Redux or trigger re-renders/APIs
  // until the user explicitly clicks Select or Reset.
  const [draftBranch, setDraftBranch] = useState(appliedFilters.branch ?? null);
  const [draftDateRange, setDraftDateRange] = useState(appliedFilters.dateRange || "Month to Date");
  const [draftStartDate, setDraftStartDate] = useState(appliedFilters.startDate || "");
  const [draftEndDate, setDraftEndDate] = useState(appliedFilters.endDate || "");

  // Sync draft state with currently applied filters whenever the filter drawer opens
  useEffect(() => {
    if (rightColumn) {
      setDraftBranch(appliedFilters.branch ?? null);
      setDraftDateRange(appliedFilters.dateRange || "Month to Date");
      setDraftStartDate(appliedFilters.startDate || "");
      setDraftEndDate(appliedFilters.endDate || "");
    }
  }, [
    rightColumn,
    appliedFilters.branch,
    appliedFilters.dateRange,
    appliedFilters.startDate,
    appliedFilters.endDate,
  ]);

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

  const isCustom = draftDateRange === "Custom";

  const handleDateRangeSelect = (e) => {
    const nextRange = e.target.value;
    setDraftDateRange(nextRange);
    if (nextRange !== "Custom") {
      const { startDate, endDate } = computeDateRangeValues(
        nextRange,
        draftStartDate,
        draftEndDate
      );
      setDraftStartDate(startDate);
      setDraftEndDate(endDate);
    }
  };

  const handleDateChangeRef = useRef(null);
  handleDateChangeRef.current = (type, selectedDates) => {
    if (!isCustom) return;
    const selected = selectedDates?.[0];
    if (!(selected instanceof Date) || isNaN(selected.getTime())) return;

    const formatted = selected.toLocaleDateString("en-GB");
    if (type === "startDate" && formatted !== draftStartDate) {
      setDraftStartDate(formatted);
    }
    if (type === "endDate" && formatted !== draftEndDate) {
      setDraftEndDate(formatted);
    }
  };

  const handleSelect = () => {
    if (typeof onApply === "function") {
      onApply({
        branch: draftBranch,
        dateRange: draftDateRange,
        startDate: draftStartDate,
        endDate: draftEndDate,
      });
    }
  };

  const handleReset = () => {
    dispatch(resetFilters());
    saveActiveBranch("mybusiness", null);
    if (typeof hideRightColumn === "function") {
      hideRightColumn();
    }
    navigate("/dashboard");
  };

  const startPickerOptions = useMemo(
    () => ({
      dateFormat: "d/m/Y",
      allowInput: isCustom,
      clickOpens: isCustom,
      onChange: [(dates) => handleDateChangeRef.current("startDate", dates)],
    }),
    [isCustom]
  );

  const endPickerOptions = useMemo(
    () => ({
      dateFormat: "d/m/Y",
      allowInput: isCustom,
      clickOpens: isCustom,
      onChange: [(dates) => handleDateChangeRef.current("endDate", dates)],
    }),
    [isCustom]
  );

  const pickerClassName = `form-control ${isCustom ? "" : "bg-light text-primary"}`;

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
              value={draftBranch ?? ""}
              onChange={(e) =>
                setDraftBranch(e.target.value === "" ? null : Number(e.target.value))
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
              value={draftDateRange}
              onChange={handleDateRangeSelect}
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
              className={pickerClassName}
              options={startPickerOptions}
              readOnly={!isCustom}
              value={draftStartDate}
            />
          </div>
        </div>

        <div className="row mb-3 align-items-center">
          <label className="col-4 col-form-label">End Date</label>
          <div className="col-8">
            <Flatpickr
              className={pickerClassName}
              options={endPickerOptions}
              readOnly={!isCustom}
              value={draftEndDate}
            />
          </div>
        </div>

        <hr className="mb-2 mt-3" />

        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-success" onClick={handleSelect}>Select</button>
          <button className="btn btn-warning" onClick={handleReset}>Reset</button>
          <button className="btn btn-danger" onClick={hideRightColumn}>Close</button>
        </div>
      </OffcanvasBody>
    </Offcanvas>
  );
};

export default FilterActions;
