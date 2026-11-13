import React, { useEffect, useRef } from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import Flatpickr from "react-flatpickr";
import { getBranches } from "../../slices/dashboardSales/thunk";

const FilterActions = ({
  branch,
  dateRange,
  startDate,
  endDate,
  onBranchChange,
  onDateRangeChange,
   onBranchNameChange, // Add this
  onStartDateChange,
  onEndDateChange,
  onApply,
  rightColumn,
  hideRightColumn,
}) => {
  const dispatch = useDispatch();
  const startRef = useRef(null);
  const endRef = useRef(null);

  // Shared branch API used by all dashboard filters
  const {
    branches: apiBranches = [],
    loading,
  } = useSelector((state) => state.powerbi);

  useEffect(() => {
    dispatch(
      getBranches({
        clientId: 1,
      }),
    );
  }, [dispatch]);

  const dateOptions = [
    "Today",
    "Yesterday",
    "This Week",
    "Last Week",
    "Month To Yesterday",
    "Month To Date",
    // "This Month",
    "Last Month",
    
    // "This Year",
    "Year To Date",
     "Year To Yesterday",
    "Last Year",
    "Custom",
  ];

  const branchOptions = (apiBranches || [])
    .map((item) => ({
      branchCode:
        item.bcode ??
        item.branchCode ??
        item.branchcode ??
        item.branch_ID ??
        item.branch_id ??
        item.branchID,

      branchName: (
        item.brancH_NAME ??
        item.branchName ??
        item.branchname ??
        item.branch_Name ??
        item.branch_name ??
        ""
      ).replace(/^AXCESS PHARMACY\s*-\s*/i, ""),
    }))
    .filter((item) => item.branchCode != null);

  const canEditEndDate = [
    "Custom",
    "Month To Date",
    "Year To Date",
  ].includes(dateRange);

  return (
    <React.Fragment>
  <div
        id="layout-rightside-coll"
        style={{
          display: rightColumn ? "block" : "none",
          position: "fixed",
          inset: 0,
          zIndex: 1055,
        }}
      >
        {/* Overlay */}
        <div
          onClick={hideRightColumn}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
          }}
        />

        {/* Filter Drawer */}
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "350px",
            maxWidth: "90vw",
            height: "100vh",
            zIndex: 1056,
          }}
        >
          <Card
            className="h-100 border-0 rounded-0"
            style={{ overflowY: "auto" }}
          >
            <CardHeader className="py-2">
              <h4 className="card-title mb-0">Filter Actions</h4>
            </CardHeader>

            <CardBody className="d-flex flex-column">
              <div className="containerFluid">

                {/* Date Range */}
                <div className="row mb-3 align-items-center">
                  <label className="col-4 col-form-label">
                    Date Range
                  </label>

                  <div className="col-8">
                    <select
                      className="form-select"
                      value={dateRange}
                      onChange={(e) =>
                        onDateRangeChange(e.target.value)
                      }
                    >
                      {dateOptions.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Start Date */}
                <div className="row mb-3 align-items-center">
                  <label className="col-4 col-form-label">
                    Start Date
                  </label>

                  <div className="col-8">
                    <Flatpickr
                      ref={startRef}
                      options={{
                        dateFormat: "d/m/Y",
                        allowInput: dateRange === "Custom",
                        clickOpens: dateRange === "Custom",
                      }}
                      value={startDate}
                      onChange={(selectedDates) => {
                        const start = selectedDates[0];

                        if (!start) return;

                        onStartDateChange(
                          start.toLocaleDateString("en-GB"),
                        );

                        onDateRangeChange("Custom");

                        if (endRef.current) {
                          endRef.current.flatpickr.set(
                            "minDate",
                            start,
                          );
                        }
                      }}
                      className={`form-control ${
                        dateRange !== "Custom"
                          ? "bg-light text-primary"
                          : "text-muted"
                      }`}
                      style={{
                        cursor:
                          dateRange !== "Custom"
                            ? "not-allowed"
                            : "pointer",
                      }}
                      placeholder="dd/mm/yyyy"
                      readOnly={dateRange !== "Custom"}
                    />
                  </div>
                </div>

                {/* End Date */}
                <div className="row mb-3 align-items-center">
                  <label className="col-4 col-form-label">
                    End Date
                  </label>

                  <div className="col-8">
                    <Flatpickr
                      ref={endRef}
                      options={{
                        dateFormat: "d/m/Y",
                        allowInput: canEditEndDate,
                        clickOpens: canEditEndDate,
                      }}
                      value={endDate}
                      onChange={(selectedDates) => {
                        const end = selectedDates[0];

                        if (!end) return;

                        onEndDateChange(
                          end.toLocaleDateString("en-GB"),
                        );

                        if (dateRange === "Custom") {
                          onDateRangeChange("Custom");
                        }

                        if (startRef.current) {
                          startRef.current.flatpickr.set(
                            "maxDate",
                            end,
                          );
                        }
                      }}
                      className={`form-control ${
                        !canEditEndDate
                          ? "bg-light text-primary"
                          : "text-muted"
                      }`}
                      style={{
                        cursor: canEditEndDate
                          ? "pointer"
                          : "not-allowed",
                      }}
                      placeholder="dd/mm/yyyy"
                      readOnly={!canEditEndDate}
                    />
                  </div>
                </div>

                {/* Branch */}
                <div className="row mb-3 align-items-center">
                  <label className="col-4 col-form-label">
                    Branch
                  </label>

                  <div className="col-8">
               <select
  className="form-select"
  value={branch ?? ""}
  onChange={(e) => {
    const selectedValue = e.target.value;

    onBranchChange(
      selectedValue === "" ? null : Number(selectedValue),
    );

    const selectedBranch = branchOptions.find(
      (b) => String(b.branchCode) === selectedValue,
    );

    onBranchNameChange?.(
      selectedValue === ""
        ? "All Branches"
        : selectedBranch?.branchName || "",
    );
  }}
>
  <option value="">
    {loading && branchOptions.length === 0
      ? "Loading branches..."
      : "All Branches"}
  </option>

  {branchOptions.map((b) => (
    <option key={b.branchCode} value={b.branchCode}>
      {b.branchName || b.branchCode}
    </option>
  ))}
</select>
                  </div>
                </div>

                <hr className="mb-2 mt-3" />

                {/* Actions */}
                <div className="d-flex justify-content-end mb-2">
                  <button
                    type="button"
                    className="btn btn-success me-2"
                    onClick={onApply}
                  >
                    Select
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={hideRightColumn}
                  >
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