import React from 'react';
import { Card, CardBody, CardHeader, Col } from 'reactstrap';
// import Vector from './VectorMap';
import { VectorMap } from '@south-paw/react-vector-maps'
import world from '../../common/world.svg.json';

const BranchPerformance = () => {
    return (
        <React.Fragment>
          
                <Card className="card-height-100">
                    <CardHeader className="align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">Branch Performance vs target</h4>
                        <div className="flex-shrink-0">
                            <button type="button" className="btn btn-soft-primary btn-sm">
                                Export Report
                            </button>
                        </div>
                    </CardHeader>

                    <CardBody>
{/* 
                        <div
                            data-colors='["--vz-light", "--vz-success", "--vz-primary"]'
                            style={{ height: "50px" }} dir="ltr">
                             <div id="world_map_line_markers" className="custom-vector-map">
                                        <VectorMap {...world} />
                                    </div>
                        </div> */}

         <div className="px-2 mt-1">

    <p className="mb-1">
        Nairobi CBD
        <span className="float-end text-success fw-semibold">92%</span>
    </p>

    <div
        className="progress mt-2 position-relative"
        style={{ height: "20px" }}
    >
        {/* Threshold Line */}
        <div
            className="position-absolute top-0 bottom-0 border-start border-2 border-light"
            style={{ left: "80%", zIndex: 2 }}
        ></div>

        <div
            className="progress-bar progress-bar-striped bg-success"
            role="progressbar"
            style={{ width: "92%" }}
        ></div>
    </div>

    <p className="mt-2 mb-1">
        Mombasa
        <span className="float-end text-primary fw-semibold">78%</span>
    </p>

    <div
        className="progress mt-2 position-relative"
        style={{ height: "20px" }}
    >
        <div
            className="position-absolute top-0 bottom-0 border-start border-2 border-light"
            style={{ left: "80%", zIndex: 2 }}
        ></div>

        <div
            className="progress-bar progress-bar-striped bg-primary"
            role="progressbar"
            style={{ width: "78%" }}
        ></div>
    </div>

    <p className="mt-2 mb-1">
        Kisumu
        <span className="float-end text-warning fw-semibold">65%</span>
    </p>

    <div
        className="progress mt-2 position-relative"
        style={{ height: "20px" }}
    >
        <div
            className="position-absolute top-0 bottom-0 border-start border-2 border-light"
            style={{ left: "80%", zIndex: 2 }}
        ></div>

        <div
            className="progress-bar progress-bar-striped bg-warning"
            role="progressbar"
            style={{ width: "65%" }}
        ></div>
    </div>

    <p className="mt-2 mb-1">
        Nakuru
        <span className="float-end text-success fw-semibold">88%</span>
    </p>

    <div
        className="progress mt-2 position-relative"
        style={{ height: "20px" }}
    >
        <div
            className="position-absolute top-0 bottom-0 border-start border-2 border-light"
            style={{ left: "80%", zIndex: 2 }}
        ></div>

        <div
            className="progress-bar progress-bar-striped bg-success"
            role="progressbar"
            style={{ width: "88%" }}
        ></div>
    </div>

    <p className="mt-2 mb-1">
        Eldoret
        <span className="float-end text-danger fw-semibold">51%</span>
    </p>

    <div
        className="progress mt-2 position-relative"
        style={{ height: "20px" }}
    >
        <div
            className="position-absolute top-0 bottom-0 border-start border-2 border-light"
            style={{ left: "80%", zIndex: 2 }}
        ></div>

        <div
            className="progress-bar progress-bar-striped bg-danger"
            role="progressbar"
            style={{ width: "51%" }}
        ></div>
    </div>

    <p className="mt-2 mb-1">
        Thika
        <span className="float-end text-success fw-semibold">84%</span>
    </p>

    <div
        className="progress mt-2 position-relative"
        style={{ height: "20px" }}
    >
        <div
            className="position-absolute top-0 bottom-0 border-start border-2 border-light"
            style={{ left: "80%", zIndex: 2 }}
        ></div>

        <div
            className="progress-bar progress-bar-striped bg-success"
            role="progressbar"
            style={{ width: "84%" }}
        ></div>
    </div>

</div>

<hr className="my-3" />

<div className="d-flex justify-content-between align-items-center">

    <p className="mb-0 text-muted small">
        Vertical line = 80% target threshold
    </p>

    {/* <span className="badge bg-danger-subtle text-danger">
        Eldoret below target
    </span> */}

</div>
                    </CardBody>
                </Card>
        
        </React.Fragment>
    );
};

export default BranchPerformance;