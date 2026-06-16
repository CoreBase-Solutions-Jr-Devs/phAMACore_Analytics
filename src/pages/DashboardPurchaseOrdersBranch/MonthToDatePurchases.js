import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import { MonthToDateCharts } from "./DashboardEcommerceCharts";
import CountUp from "react-countup";
import { useSelector, useDispatch } from "react-redux";
import { getRevenueChartsData } from "../../slices/thunks";
import { createSelector } from "reselect";

const MonthToDatePurchases = ({categories, series, formatAmount}) => {
  // const dispatch = useDispatch();

  // const [chartData, setchartData] = useState([]);

  // const selectDashboardData = createSelector(
  //   (state) => state.DashboardEcommerce,
  //   (revenueData) => revenueData.revenueData
  // );
  // // Inside your component
  // const revenueData = useSelector(selectDashboardData);


  // useEffect(() => {
  //   setchartData(revenueData);
  // }, [revenueData]);

  // const onChangeChartPeriod = pType => {
  //   dispatch(getRevenueChartsData(pType));
  // };

  // useEffect(() => {
  //   dispatch(getRevenueChartsData("all"));
  // }, [dispatch]);
  return (
    <React.Fragment>
      <Card>
        <CardHeader className="border-0 align-items-center d-flex">
          <h4 className="card-title mb-0 flex-grow-1">Month to Date Purchases Trend(MTD) </h4>
          {/* <div className="d-flex gap-1">
            <button type="button" className="btn btn-soft-secondary btn-sm" onClick={() => { onChangeChartPeriod("all"); }}>
              ALL
            </button>
            <button type="button" className="btn btn-soft-secondary btn-sm" onClick={() => { onChangeChartPeriod("month"); }}>
              1M
            </button>
            <button type="button" className="btn btn-soft-secondary btn-sm" onClick={() => { onChangeChartPeriod("halfyear"); }}>
              6M
            </button>
            <button type="button" className="btn btn-soft-primary btn-sm" onClick={() => { onChangeChartPeriod("year"); }}>
              1Y
            </button>
          </div> */}
        </CardHeader>

        <CardBody className="p-0 pb-2">
          <div className="w-100">
            <div dir="ltr">
              <MonthToDateCharts categories={categories} series={series} formatAmount={formatAmount} dataColors='["--vz-primary", "--vz-success", "--vz-danger"]' />
            </div>
          </div>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default MonthToDatePurchases;
