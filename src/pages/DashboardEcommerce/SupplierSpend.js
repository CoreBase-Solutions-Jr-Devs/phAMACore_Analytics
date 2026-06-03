import React, { useState, useEffect } from 'react';
import { Card, Col, CardHeader } from 'reactstrap';
import classNames from "classnames";
import { useSelector, useDispatch } from "react-redux";
import { SpendCharts } from './DashboardEcommerceCharts';
import { getAllData } from "../../slices/thunks";
import { createSelector } from 'reselect';

const getColor = (percent) => {
  if (percent >= 75) return "bg-success";
  if (percent >= 50) return "bg-primary";
  if (percent >= 30) return "bg-warning";
  return "bg-danger";
};

const SupplierSpend = ({ supplierData, formatAmount }) => {
    // const dispatch = useDispatch();

    // const [periodType, setPeriodType] = useState("halfyearly");

    // const liveuserData = createSelector(
    //     (state) => state.DashboardAnalytics,
    //     (chartData) => chartData.chartData
    // );

    // const chartData = useSelector(liveuserData);

    // const onChangeChartPeriod = (pType) => {
    //     setPeriodType(pType);
    //     dispatch(getAllData(pType));
    // };

    // useEffect(() => {
    //     dispatch(getAllData("halfyearly"));
    // }, [dispatch]);

    const hasData =
    Array.isArray(supplierData) &&
    supplierData.length > 0;

    return (
        <React.Fragment>
      
                <Card className="card-height-100">

                    <CardHeader className="card-header align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">
                           Top  Suppliers by Spend
                        </h4>
                        </CardHeader>
                    <div className="card-body p-3">
     
                        {!hasData ? (
           <div className="text-center py-5">
          <h6 className="text-muted mb-2">
            No supplier spend data available
            </h6>
          </div>
        ) : (
          <div className="px-2 mt-1">
  {supplierData.map((item) => {
    const maxValue = Math.max(
      ...supplierData.map((d) => d.value),
      1
    );

    const percent = (item.value / maxValue) * 100;
            const color = getColor(percent);

    return (
      <div key={item.name} className="mb-0">
          <div className="d-flex justify-content-between">
                    <span className="text-uppercase"> 
                      {item.name}
                    </span>
  <span className="text-muted">
                KES {formatAmount(item.value)}
          </span>
        </div>

        <div
          className="progress mt-2"
          style={{
            height: "20px",
          }}
        >
          <div
            className={`progress-bar progress-bar-striped ${color}`}
            role="progressbar"
            style={{
              width: `${percent}%`,
            }}
          />
        </div>
      </div>
    );
  })}
</div>
        )}
                        <hr className="my-2" />
                        <div>

  {/* <p className="mb-2 text-muted ">
    Cosmos + Biodeal = <strong>66%</strong> of spend concentration within safe range (&lt;70%).
  </p>

  <p className="mb-0 text-danger fw-semibold">
    Universal + PharmaChem = <strong>KES 1.6M</strong> with C/D rated suppliers.
  </p> */}

</div>
                    </div>

                </Card>
       
        </React.Fragment>
    );
};

export default SupplierSpend;