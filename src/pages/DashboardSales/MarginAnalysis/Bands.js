import React, { useState } from "react";
import { Card, CardBody, Row, Col } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import Drilldown from "./Drilldown";
import {
  exportDashboardReportToExcel,
  triggerPrint,
} from "../../../helpers/export_helper";
const Bands = ({
  marginBand25,
  marginBand25To30,
  marginBand30To45,
  marginBandAbove45,
  selectedBranchName,
  loading,
  error,
  rightClickBtn,
}) => {
  const { branch, dateRange, startDate, endDate } = useSelector(
    (state) => state.marginAnalysis.filters,
  );
  console.log("Margin Band 25:", marginBand25);
  console.log("Margin Band 25-30:", marginBand25To30);
  console.log("Margin Band 30-45:", marginBand30To45);
  console.log("Margin Band Above 45:", marginBandAbove45);
  const handleCardClick = (band, data) => {
    setSelectedBand(band);
    setSelectedDrilldown(data);
    setShowDrilldown(true);
  };
  const handleExportExcel = () => {
    const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

    const metadata = [
      {
        label: "Report",
        value: "Margin Analysis",
      },
      {
        label: "Generated Date",
        value: new Date().toLocaleString("en-GB"),
      },
      {
        label: "Selected Branch",
        value: selectedBranchName || "All Branches",
      },
      {
        label: "Date Range Filter",
        value: `${startDate || ""} to ${endDate || ""}`,
      },
    ];

    const bands = [
      { name: "Below 25%", data: marginBand25 },
      { name: "25% to 30%", data: marginBand25To30 },
      { name: "30% to 45%", data: marginBand30To45 },
      { name: "Above 45%", data: marginBandAbove45 },
    ];

    const rows = bands.map(({ name, data }) => ({
      "Margin Band": name,
      "Sales Value (KES)": Number(data?.sales_value_kes ?? 0),
      "Sales Share (%)": Number(data?.sales_share_perc ?? 0),
    }));

    const sections = [
      {
        title: "Margin Band Performance",
        headers: ["Margin Band", "Sales Value (KES)", "Sales Share (%)"],
        data: rows,
      },
    ];

    exportDashboardReportToExcel(
      {
        title: "Margin Analysis Report",
        metadata,
        sections,
      },
      `Margin_Analysis_${todayStr}`,
    );
  };

  const handlePrint = () => {
    triggerPrint();
  };
  return (
    <React.Fragment>
      {loading ? (
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
            aria-label="Loading performance metrics"
          ></div>
        </div>
      ) : error ? (
        <div className="text-center py-5">
          <p className="text-danger mb-0">{error}</p>
        </div>
      ) : (
        <Row
          className="g-2 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4"
          id="margin-band-widgets"
        >
          <Col className="d-flex">
            <Card className="card-animate w-100 h-80">
              <CardBody className="p-2 d-flex flex-column">
                <div>
                  <div className="d-flex justify-content-between align-items-center">
                    <p className="font-medium mb-0">{"<25%"}</p>
                  </div>
                  <h5 className="mt-2 ff-secondary fw-semibold text-secondary">
                    KES{" "}
                    {Number(marginBand25.sales_value_kes || 0).toLocaleString(
                      "en-KE",
                    )}
                  </h5>
                </div>
                <p className="mb-0 text-muted mt-auto">
                  {Number(marginBand25.sales_share_perc ?? 0).toFixed(1)}% of
                  total sales
                </p>
              </CardBody>
            </Card>
          </Col>

          <Col className="d-flex">
            <Card className="card-animate w-100 h-80">
              <CardBody className="p-2 d-flex flex-column">
                <div>
                  <div className="d-flex justify-content-between align-items-center">
                    <p className="font-medium mb-0">{"25% to 30%"}</p>
                  </div>
                  <h5 className="mt-2 ff-secondary fw-semibold text-warning">
                    KES{" "}
                    {Number(
                      marginBand25To30.sales_value_kes || 0,
                    ).toLocaleString("en-KE")}
                  </h5>
                </div>

                <p className="mb-0 text-muted mt-auto">
                  {Number(marginBand25To30.sales_share_perc ?? 0).toFixed(1)}%
                  of total sales
                </p>
              </CardBody>
            </Card>
          </Col>
          <Col className="d-flex">
            <Card className="card-animate w-100 h-80">
              <CardBody className="p-2 d-flex flex-column">
                <div>
                  <div className="d-flex justify-content-between align-items-center">
                    <p className="font-medium mb-0">{"30% to 45%"}</p>
                  </div>
                  <h5 className="mt-2 ff-secondary fw-semibold text-danger">
                    KES{" "}
                    {Number(
                      marginBand30To45.sales_value_kes || 0,
                    ).toLocaleString("en-KE")}
                  </h5>
                </div>

                <p className="mb-0 text-muted mt-auto">
                  {Number(marginBand30To45.sales_share_perc ?? 0).toFixed(1)}%
                  of total sales
                </p>
              </CardBody>
            </Card>
          </Col>
          <Col className="d-flex">
            <Card className="card-animate w-100 h-80">
              <CardBody className="p-2 d-flex flex-column">
                <div>
                  <div className="d-flex justify-content-between align-items-center">
                    <p className="font-medium mb-0">{">45%"}</p>
                  </div>
                  <h5 className="mt-2 ff-secondary fw-semibold text-success">
                    KES{" "}
                    {Number(
                      marginBandAbove45.sales_value_kes || 0,
                    ).toLocaleString("en-KE")}
                  </h5>
                </div>

                <p className="mb-0 text-muted mt-auto">
                  {Number(marginBandAbove45.sales_share_perc ?? 0).toFixed(1)}%
                  of total sales
                </p>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}
    </React.Fragment>
  );
};

export default Bands;
