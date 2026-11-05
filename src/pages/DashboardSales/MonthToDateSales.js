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
import { exportToExcel } from "../../helpers/export_helper";
import CardExportButtons from "../../Components/Common/CardExportButtons";

const MonthToDateSales = ({
  series,
  categories,
  salesVariance,
  salesGrowth,
  grossProfit,
  CostOfGoods,
  formatAmount,
}) => {
  const currentDayIndex = new Date().getDate() - 1;

  const currentDayVariance = salesVariance?.[currentDayIndex];
  const currentDayGrowth = salesGrowth?.[currentDayIndex];
  const currentDayGP = grossProfit?.[currentDayIndex];
  const currentDayCOGS = CostOfGoods?.[currentDayIndex];

  const handleExportExcel = () => {
    const rows = (categories || []).map((cat, idx) => {
      const row = { Day: cat };
      (series || []).forEach((s) => {
        row[s.name || "Value"] = Number(s.data?.[idx] || 0).toLocaleString(
          undefined,
          { minimumFractionDigits: 2 },
        );
      });
      return row;
    });
    const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    exportToExcel(rows, `Month_To_Date_Sales_${todayStr}`);
  };

  return (
    <React.Fragment>
      <Row>
        <Col xxl={12}>
          <Card id="sales-mtd-card">
            <CardHeader className="p-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h4 className="card-title mb-0 ">
                Month To Date Sales Comparative Graph (MTD)
              </h4>
              <div className="d-flex align-items-center">
                <CardExportButtons
                  targetId="sales-mtd-card"
                  title="Month To Date Sales"
                  onExport={handleExportExcel}
                />
              </div>
            </CardHeader>
            <CardBody className="p-2">
              {/* <Row
                className="g-1 mb-0 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-4"
                id="sales-ytd-widgets"
              > */}
                {/* Sales Variance */}
                {/* <Col className="d-flex">
                  <Card
                    className="card-animate w-100 mb-0"
                    style={{ height: "65px", minHeight: "75px" }}
                  >
                    <CardBody className="p-1 d-flex flex-column">
                      <div>
                        <p className="text-muted mb-0"> Variance</p>

                        <p
                          className={`mt-1 ff-secondary  ${
                            Number(currentDayVariance) >= 0
                              ? "text-success"
                              : "text-danger"
                          }`}
                        >
                          <span className="d-flex align-items-center fw-semibold gap-1">
                            {Number(currentDayVariance ?? 0) === 0
                              ? "_"
                              : Number(currentDayVariance).toLocaleString(
                                  "en-KE",
                                )}
                            <i className="ri-arrow-right-down-line fs-18"></i>
                          </span>
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                </Col> */}

                {/* Sales Growth */}
                {/* <Col className="d-flex">
                  <Card
                    className="card-animate w-100 mb-0"
                    style={{ height: "65px", minHeight: "75px" }}
                  >
                    <CardBody className="p-1 d-flex flex-column">
                      <div>
                        <p className="text-muted mb-0">Growth</p>

                        <p
                          className={`mt-1 ff-secondary  ${
                            Number(currentDayGrowth) >= 0
                              ? "text-success"
                              : "text-danger"
                          }`}
                        >
                          <span className="d-flex align-items-center fw-semibold gap-1">
                            {Number(currentDayGrowth ?? 0) === 0
                              ? "_"
                              : `${Number(currentDayGrowth).toFixed(2)}%`}
                            <i className="ri-arrow-right-down-line fs-18"></i>
                          </span>
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                </Col> */}

                {/* COGS */}
                {/* <Col className="d-flex">
                  <Card
                    className="card-animate w-100 mb-0"
                    style={{ height: "65px", minHeight: "75px" }}
                  >
                    <CardBody className="p-1 d-flex flex-column">
                      <div>
                        <p className="text-muted mb-0">COGS</p>

                        <p
                          className={`mt-1 ff-secondary  ${
                            Number(currentDayCOGS) >= 0
                              ? "text-success"
                              : "text-danger"
                          }`}
                        >
                          <span className="d-flex align-items-center gap-1 fw-semibold">
                            {Number(currentDayCOGS ?? 0) === 0
                              ? "_"
                              : Number(currentDayCOGS).toLocaleString("en-KE")}
                            <i className="ri-arrow-right-down-line fs-18"></i>
                          </span>
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                </Col> */}

                {/* Gross Profit */}
                {/* <Col className="d-flex">
                  <Card
                    className="card-animate w-100 mb-0"
                    style={{ height: "65px", minHeight: "75px" }}
                  >
                    <CardBody className="p-1 d-flex flex-column">
                      <div>
                        <p className="text-muted mb-0">Profit (GP)</p>

                        <p
                          className={`mt-1 ff-secondary ${
                            Number(currentDayGP) >= 0
                              ? "text-success"
                              : "text-danger"
                          }`}
                        >
                          <span className="d-flex align-items-center fw-semibold gap-1">
                            {Number(currentDayGP ?? 0) === 0
                              ? "_"
                              : Number(currentDayGP).toLocaleString(
                                  "en-KE",
                                )}{" "}
                            <i className="ri-arrow-right-down-line fs-18"></i>
                          </span>
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                </Col> */}
              {/* </Row> */}
{/* Chart Legend */}
<div className="d-flex justify-content-end align-items-center gap-3 px-3 pt-2 pb-1">
  <div className="d-flex align-items-center gap-2">
    <span
      style={{
        display: "inline-block",
        width: "25px",
        borderTop: "3px solid var(--vz-primary)",
      }}
    />
    <span className="text-muted">2026</span>
  </div>

  <div className="d-flex align-items-center gap-2">
    <span
      style={{
        display: "inline-block",
        width: "25px",
        borderTop: "3px dashed var(--vz-primary)",
      }}
    />
    <span className="text-muted">2025</span>
  </div>
</div>
              <MonthToDateSalesChart
                series={series}
                categories={categories}
                salesVariance={salesVariance}
                salesGrowth={salesGrowth}
                grossProfit={grossProfit}
                CostOfGoods={CostOfGoods}
                formatAmount={formatAmount}
                dataColors='["--vz-primary","--vz-success","--vz-gray-300"]'
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default MonthToDateSales;
