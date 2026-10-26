import React, { useMemo, useRef } from "react";
import { Offcanvas, OffcanvasHeader, OffcanvasBody } from "reactstrap";
import Flatpickr from "react-flatpickr";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { setBranch, setDateRange, setStartDate, setEndDate, resetFilters } from "../../slices/dashboardStock/reducer";
import { getCachedBranchesMap, cleanBranchName, saveActiveBranch } from "../../helpers/branch_helper";

const dateOptions = ["Today", "Yesterday", "Last 7 Days", "Last Week", "This Week", "Month to Date", "Last Month", "This Year", "Last Year", "Custom"];

const FilterActions = ({ onApply, rightColumn, hideRightColumn }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        branches: reduxBranches = [],
        filters: { branch, dateRange, startDate, endDate },
    } = useSelector((state) => state.StockInventory);

    const branches = useMemo(() => {
        if (reduxBranches && reduxBranches.length > 0) {
            return reduxBranches.map((b) => ({
                ...b,
                branchName: cleanBranchName(b.branchName),
            }));
        }
        const cachedMap = getCachedBranchesMap();
        return Object.entries(cachedMap).map(([k, v]) => ({
            branchCode: Number(k),
            branchName: cleanBranchName(v),
        }));
    }, [reduxBranches]);

    const isCustom = dateRange === "Custom";

    const handleDateChangeRef = useRef(null);
    handleDateChangeRef.current = (type, selectedDates) => {
        const selected = selectedDates?.[0];
        if (!(selected instanceof Date) || isNaN(selected.getTime())) return;

        const formatted = selected.toLocaleDateString("en-GB");
        if (dateRange !== "Custom") {
            dispatch(setDateRange("Custom"));
        }

        if (type === "startDate") dispatch(setStartDate(formatted));
        if (type === "endDate") dispatch(setEndDate(formatted));
    };

    const handleReset = () => {
        dispatch(resetFilters());
        saveActiveBranch("stock", null);
        navigate("/dashboard-stock");
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
                            value={branch ?? ""}
                            onChange={(e) => dispatch(setBranch(e.target.value === "" ? null : Number(e.target.value)))}
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
                            className={pickerClassName}
                            options={startPickerOptions}
                            readOnly={!isCustom}
                            value={startDate}
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
                            value={endDate}
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