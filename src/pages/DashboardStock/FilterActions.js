import React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import Flatpickr from "react-flatpickr";
import { useDispatch, useSelector } from "react-redux";

import { setBranch, setDateRange, setStartDate, setEndDate } from "../../slices/dashboardStock/reducer";

const FilterActions = ({ onApply, rightColumn, hideRightColumn }) => {

    const dispatch = useDispatch();

    const {
        branches = [],
        filters: { branch, dateRange, startDate, endDate },
    } = useSelector((state) => state.StockInventory);

    const dateOptions = ["Today", "Yesterday", "Last 7 Days", "Last Week", "This Week", "This Month", "Last Month", "This Year", "Custom"];

    const handleDateChange = (type, selectedDates) => {
        if (!selectedDates?.length) return;

        const formatted = selectedDates[0].toLocaleDateString("en-GB");

        dispatch(setDateRange("Custom"));

        if (type === "startDate") {
            dispatch(setStartDate(formatted));
        }
        if (type === "endDate") {
            dispatch(setEndDate(formatted));
        }
    };

    const handleReset = () => {
        dispatch(setBranch(null));
        dispatch(setDateRange("Today"));
    };

    return (
        <div
            className={ rightColumn
                ? "layout-rightside-col d-block"
                : "layout-rightside-col d-none"
            }
        >
            <div className="overlay" onClick={hideRightColumn} />

            <div className="layout-rightside h-100">
                <Card className="h-100 card-animate">

                    <CardHeader className="py-2">
                        <h5 className="mb-0">Filter Actions</h5>
                    </CardHeader>

                    <CardBody>

                        <div className="row mb-3 align-items-center">
                            <label className="col-4 col-form-label">Branch</label>
                            <div className="col-8">
                                <select
                                    className="form-select"
                                    value={branch ?? ""}
                                    onChange={(e) => dispatch(setBranch(e.target.value === ""
                                                ? null
                                                : Number(e.target.value)
                                            ))}
                                >
                                    <option value="">
                                        All Branches
                                    </option>

                                    {branches.map((b) => (
                                        <option
                                            key={b.branchCode}
                                            value={b.branchCode}
                                        >
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
                                    onChange={(e) =>dispatch(setDateRange(e.target.value))}
                                >
                                    {dateOptions.map((option) => (
                                        <option
                                            key={option}
                                            value={option}
                                        >
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
                                    className={`form-control ${dateRange !== "Custom"
                                            ? "bg-light text-primary"
                                            : ""
                                        }`}
                                    options={{
                                        dateFormat: "d/m/Y",
                                        allowInput: dateRange === "Custom",
                                        clickOpens: dateRange === "Custom",
                                    }}
                                    value={startDate}
                                    onChange={(dates) => handleDateChange("startDate", dates)}
                                    readOnly={dateRange !== "Custom"}
                                />
                            </div>
                        </div>

                        <div className="row mb-3 align-items-center">
                            <label className="col-4 col-form-label">End Date</label>
                            <div className="col-8">
                                <Flatpickr
                                    className={`form-control ${dateRange !== "Custom"
                                            ? "bg-light text-primary"
                                            : ""
                                        }`}
                                    options={{
                                        dateFormat: "d/m/Y",
                                        allowInput:dateRange ==="Custom",
                                        clickOpens:dateRange ==="Custom",
                                    }}
                                    value={endDate}
                                    onChange={(dates) => handleDateChange("endDate",dates)
                                    }
                                    readOnly={dateRange !== "Custom"}
                                />
                            </div>
                        </div>

                        <hr className="mb-2 mt-3" />

                        <div className="d-flex justify-content-end gap-2">
                            <button className="btn btn-success" onClick={onApply}>
                                Select
                            </button>

                            <button className="btn btn-warning" onClick={handleReset}>
                                Reset
                            </button>

                            <button className="btn btn-danger" onClick={hideRightColumn}>
                                Close
                            </button>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default FilterActions;