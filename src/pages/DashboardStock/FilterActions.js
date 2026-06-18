import React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import Flatpickr from "react-flatpickr";
import { useDispatch, useSelector } from "react-redux";

import { setBranch, setDateRange, setStartDate, setEndDate } from "../../slices/dashboardStock/reducer";

const FilterActions = ({ onApply, rightColumn, hideRightColumn }) => {

    const dispatch = useDispatch();

    const {
        branches = [],
        filters: {
            branch,
            dateRange,
            startDate,
            endDate,
        },
    } = useSelector((state) => state.StockInventory);

    const dateOptions = ["Today", "Yesterday", "Last 7 Days", "Custom"];

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
            className={
                rightColumn
                    ? "layout-rightside-col d-block"
                    : "layout-rightside-col d-none"
            }
        >
            <div className="overlay" onClick={hideRightColumn} />

            <div className="layout-rightside h-100">
                <Card className="h-100 card-animate">

                    <CardHeader className="py-2">
                        <h5 className="mb-0">Filters</h5>
                    </CardHeader>

                    <CardBody>

                        <div className="mb-3">
                            <label>Branch</label>

                            <select
                                className="form-select"
                                value={branch ?? ""}
                                onChange={(e) =>
                                    dispatch(
                                        setBranch(
                                            e.target.value === ""
                                                ? null
                                                : Number(
                                                      e.target.value
                                                  )
                                        )
                                    )
                                }
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

                        <div className="mb-3">
                            <label>Date Range</label>

                            <select
                                className="form-select"
                                value={dateRange}
                                onChange={(e) =>
                                    dispatch(
                                        setDateRange(
                                            e.target.value
                                        )
                                    )
                                }
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

                        <div className="mb-3">
                            <label>Start Date</label>
                            <Flatpickr
                                className={`form-control ${
                                    dateRange !== "Custom"
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

                        <div className="mb-3">
                            <label>End Date</label>
                            <Flatpickr
                                className={`form-control ${
                                    dateRange !== "Custom"
                                        ? "bg-light text-primary"
                                        : ""
                                }`}
                                options={{
                                    dateFormat: "d/m/Y",
                                    allowInput:
                                        dateRange ===
                                        "Custom",
                                    clickOpens:
                                        dateRange ===
                                        "Custom",
                                }}
                                value={endDate}
                                onChange={(dates) =>
                                    handleDateChange(
                                        "endDate",
                                        dates
                                    )
                                }
                                readOnly={
                                    dateRange !== "Custom"
                                }
                            />
                        </div>

                        <div className="d-flex justify-content-end gap-2">
                            <button className="btn btn-success" onClick={onApply}>
                                Apply
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