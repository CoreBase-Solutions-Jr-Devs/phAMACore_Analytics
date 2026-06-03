import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  UncontrolledDropdown,
} from "reactstrap";
import CountUp from "react-countup";
import Countdown from "react-countdown";
import { useSelector, useDispatch } from "react-redux";
import { getMarketChartsDatas } from "../../slices/thunks";

import { MonthToDateSalesChart } from "./DashboardAnalyticsCharts";
import { Link } from "react-router-dom";
import { createSelector } from "reselect";

const MonthToDateSales = ({ series, categories, formatAmount }) => {
  return (
    <React.Fragment>
      <Row>
        <Col xxl={12}>
          <Card>
            <CardBody className="p-0">
              <Row>
                <Col xxl={12}>
                  <div className="">
                    <CardHeader className="border-0 align-items-center d-flex">
                      <h4 className="card-title mb-0 flex-grow-1">
                        {" "}
                        Month To Date Sales Performance Trend (MTD)
                      </h4>
                      <div className="d-flex gap-1">
                      </div>
                    </CardHeader>
                    <MonthToDateSalesChart
                      series={series}
                      categories={categories}
                      formatAmount={formatAmount}
                      dataColors='["--vz-primary","--vz-success","--vz-gray-300"]'
                    />{" "}
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default MonthToDateSales;
