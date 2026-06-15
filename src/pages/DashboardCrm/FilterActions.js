import React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";

const FilterActions = ({ filters, setFilters, rightColumn, hideRightColumn }) => {

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFilters((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleReset = () => {
        setFilters({
            clientid: 1,
            startDate: "",
            endDate: "",
            branchcode: 0,
            itemcode: ""
        });
    };

    return (
        <div
            className={
                rightColumn
                    ? "layout-rightside-col d-block"
                    : "layout-rightside-col d-none"
            }
            id="layout-rightside-coll"
        >
            <div className="overlay" onClick={hideRightColumn}></div>

            <div className="layout-rightside h-100">
                <Card className="h-100 card-animate">

                    <CardHeader className="py-2">
                        <h5 className="mb-0">Filters</h5>
                    </CardHeader>

                    <CardBody className="d-flex flex-column h-100">
                        <div className="containerFluid">
                            <div className="mb-3">
                                <label>Client ID</label>
                                <input
                                    className="form-control"
                                    name="clientid"
                                    value={filters.clientid}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="startDate"
                                    value={filters.startDate}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label>End Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="endDate"
                                    value={filters.endDate}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label>Branch Code</label>
                                <input
                                    className="form-control"
                                    name="branchcode"
                                    value={filters.branchcode}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label>Item Code</label>
                                <input
                                    className="form-control"
                                    name="itemcode"
                                    value={filters.itemcode}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="d-flex justify-content-end gap-2">
                                <button className="btn btn-success" onClick={hideRightColumn}>
                                    Apply
                                </button>

                                <button className="btn btn-warning" onClick={handleReset}>
                                    Reset
                                </button>

                                <button className="btn btn-danger" onClick={hideRightColumn}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default FilterActions;