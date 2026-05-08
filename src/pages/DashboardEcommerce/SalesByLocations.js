import React from 'react';
import { Card, CardBody, CardHeader, Col } from 'reactstrap';
// import Vector from './VectorMap';
import { VectorMap } from '@south-paw/react-vector-maps'
import world from '../../common/world.svg.json';

const SalesByLocations = () => {
    return (
        <React.Fragment>
          
                <Card className="card-height-100">
                    <CardHeader className="align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">Spend by branch-April 2026</h4>
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
                            <p className="mb-1">Nairobi CBD <span className="float-end">4.20M</span></p>
                            <div className="progress mt-2" style={{ height: "20px" }}>
                                <div className="progress-bar progress-bar-striped bg-primary" role="progressbar"
                                    style={{ width: "75%" }} aria-valuenow="75" aria-valuemin="0" aria-valuemax="75">
                                </div>
                            </div>

                            <p className="mt-3 mb-1">Mombasa <span className="float-end">2.52M</span></p>
                            <div className="progress mt-2" style={{ height: "20px" }}>
                                <div className="progress-bar progress-bar-striped bg-primary" role="progressbar"
                                    style={{ width: "65%" }} aria-valuenow="47" aria-valuemin="0" aria-valuemax="47">
                                </div>
                            </div>

                            <p className="mt-3 mb-1">Thika <span className="float-end">1.88M</span></p>
                            <div className="progress mt-2" style={{ height: "20px" }}>
                                <div className="progress-bar progress-bar-striped bg-danger" role="progressbar"
                                    style={{ width: "55%" }} aria-valuenow="82" aria-valuemin="0" aria-valuemax="82">
                                </div>
                            </div>

                               <p className="mt-3 mb-1">Nakuru <span className="float-end">1.48M</span></p>
                            <div className="progress mt-2" style={{ height: "20px" }}>
                                <div className="progress-bar progress-bar-striped bg-danger" role="progressbar"
                                    style={{ width: "45%" }} aria-valuenow="72" aria-valuemin="0" aria-valuemax="72">
                                </div>
                            </div>

                               <p className="mt-3 mb-1">Kisumu <span className="float-end">1.18M</span></p>
                            <div className="progress mt-2" style={{ height: "20px" }}>
                                <div className="progress-bar progress-bar-striped bg-warning" role="progressbar"
                                    style={{ width: "35%" }} aria-valuenow="62" aria-valuemin="0" aria-valuemax="62">
                                </div>
                            </div>

                                   <p className="mt-3 mb-1">Eldoret <span className="float-end">0.59M</span></p>
                            <div className="progress mt-2" style={{ height: "20px" }}>
                                <div className="progress-bar progress-bar-striped bg-warning" role="progressbar"
                                    style={{ width: "25%" }} ariavaluenow="52" aria-valuemin="0" aria-valuemax="52">
                                </div>
                            </div>
                        </div>
                          <hr className="my-2" />
                        <p className="mb-2 text-muted ">
    Eldoret spend (Kes 0.99M) is critically low relative to territory size,
    signaling chronic under-ordering.
</p>
                    </CardBody>
                </Card>
        
        </React.Fragment>
    );
};

export default SalesByLocations;