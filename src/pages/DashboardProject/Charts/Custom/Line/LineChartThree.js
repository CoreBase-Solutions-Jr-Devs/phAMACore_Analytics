import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Col, DropdownItem, DropdownMenu, DropdownToggle, Row, UncontrolledDropdown } from 'reactstrap';
import CountUp from "react-countup";
import Countdown from "react-countdown";
import { useSelector, useDispatch } from "react-redux";
import { getMarketChartsDatas } from '../../../../../slices/thunks';

// Import Chart
import { ProgressiveSalesChart } from '../../../../DashboardAnalytics/DashboardAnalyticsCharts';
import { Link } from 'react-router-dom';
import { createSelector } from 'reselect';

const LineChartThree = () => {
    const dispatch = useDispatch();
    const [periodType, setPeriodType] = useState("all");
    const [chartData, setchartData] = useState([]);

    const selectmarketData = createSelector(
        (state) => state.DashboardNFT,
        (marketplaceData) => marketplaceData.marketplaceData
    );
    // Inside your component
    const marketplaceData = useSelector(selectmarketData);


    useEffect(() => {
        setchartData(marketplaceData);
    }, [marketplaceData]);

    const onChangeChartPeriod = pType => {
        dispatch(getMarketChartsDatas(pType));
    };

    useEffect(() => {
        dispatch(getMarketChartsDatas("all"));
    }, [dispatch]);
    const renderer = ({ days, hours, minutes, seconds, completed }) => {
        if (completed) {
            // Render a completed state
            return <span>You are good to go!</span>
        } else {
            return (
                <>
                    <div className="countdownlist">
                        <div className="countdownlist-item">
                            <div className="count-title">Days</div>
                            <div className="count-num">{days}</div></div>
                        <div className="countdownlist-item">
                            <div className="count-title">Hours</div>
                            <div className="count-num">{hours}</div></div>
                        <div className="countdownlist-item"><div className="count-title">Minutes</div>
                            <div className="count-num">{minutes}</div></div><div className="countdownlist-item">
                            <div className="count-title">Seconds</div>
                            <div className="count-num">{seconds}</div></div>
                    </div>
                </>
            )
        }
    }
    return (
        <React.Fragment>
            <Row>
                <Col xxl={12}>
                    <Card>
                        <CardBody className="p-0">
                            <Row className="g-0">
                                <Col xxl={8}>
                                    <div className="">
                                        <CardHeader className="border-0 align-items-center d-flex">
                                            <h4 className="card-title mb-0 flex-grow-1"> Sales Performance Trend (MTD vs YTD)</h4>
                                            <div className='d-flex gap-1'>
                                                <button type="button" className="btn btn-soft-secondary btn-sm" onClick={() => {
                                                    setPeriodType("all");
                                                    onChangeChartPeriod("all");
                                                }}>
                                                    ALL
                                                </button>
                                                <button type="button" className="btn btn-soft-secondary btn-sm" onClick={() => { setPeriodType("month"); onChangeChartPeriod("month"); }}>
                                                    1M
                                                </button>
                                                <button type="button" className="btn btn-soft-secondary btn-sm" onClick={() => { setPeriodType("halfyear"); onChangeChartPeriod("halfyear"); }}>
                                                    6M
                                                </button>

                                            </div>
                                        </CardHeader>
                                        <ProgressiveSalesChart series={chartData} period={periodType} dataColors='["--vz-primary","--vz-success", "--vz-gray-300"]' />
                                    </div>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </React.Fragment>
    );
}

export default LineChartThree;