import React, { useState, useEffect } from 'react';
import { Card, Col } from 'reactstrap';
import classNames from "classnames";
import { useSelector, useDispatch } from "react-redux";
import { SpendCharts } from './DashboardEcommerceCharts';
import { getAllData } from "../../slices/thunks";
import { createSelector } from 'reselect';

const SupplierSpend = () => {
    const dispatch = useDispatch();

    const [periodType, setPeriodType] = useState("halfyearly");

    const liveuserData = createSelector(
        (state) => state.DashboardAnalytics,
        (chartData) => chartData.chartData
    );

    const chartData = useSelector(liveuserData);

    const onChangeChartPeriod = (pType) => {
        setPeriodType(pType);
        dispatch(getAllData(pType));
    };

    useEffect(() => {
        dispatch(getAllData("halfyearly"));
    }, [dispatch]);

    return (
        <React.Fragment>
      
                <Card className="card-height-100">

                    <div className="card-header align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">
                           SPEND BY SUPPLIER 
                        </h4>

                        <div className="d-flex gap-1">
                            <button
                                type="button"
                                className={classNames(
                                    { active: periodType === "all" },
                                    "btn btn-soft-secondary btn-sm"
                                )}
                                onClick={() => onChangeChartPeriod("all")}
                            >
                                ALL
                            </button>

                            <button
                                type="button"
                                className={classNames(
                                    { active: periodType === "monthly" },
                                    "btn btn-soft-primary btn-sm"
                                )}
                                onClick={() => onChangeChartPeriod("monthly")}
                            >
                                1M
                            </button>

                            <button
                                type="button"
                                className={classNames(
                                    { active: periodType === "halfyearly" },
                                    "btn btn-soft-secondary btn-sm"
                                )}
                                onClick={() => onChangeChartPeriod("halfyearly")}
                            >
                                6M
                            </button>
                        </div>
                    </div>

                    <div className="card-body p-3">
                    <h6 className=" px-3 pt-2 ">
        Supplier concentration - April 2026 (KES)
    </h6>
                        <SpendCharts
                            series={chartData}
                            dataColors='[
                                "--vz-info",
                                "--vz-info",
                                "--vz-warning",
                                "--vz-danger",
                                "--vz-danger"
                            ]'
                        />
                        <hr className="my-2" />
                        <div>

  <p className="mb-2 text-muted ">
    Cosmos + Biodeal = <strong>66%</strong> of spend concentration within safe range (&lt;70%).
  </p>

  <p className="mb-0 text-danger fw-semibold">
    Universal + PharmaChem = <strong>KES 1.6M</strong> with C/D rated suppliers.
  </p>

</div>
                    </div>

                </Card>
       
        </React.Fragment>
    );
};

export default SupplierSpend;