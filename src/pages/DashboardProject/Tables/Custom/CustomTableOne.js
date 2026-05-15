
import React from 'react';
import { StrippedRow } from '../../../Tables/BasicTables/BasicTablesCode';
import { Card, CardBody, Col, Table } from 'reactstrap';
import PreviewCardHeader from '../../../../Components/Common/PreviewCardHeader';

const CustomTableOne = () => {
    return (
        <Col>
            <Card>
                <PreviewCardHeader title="Revenue By Salesperson" />
                <CardBody>
                    {/* <p className="text-muted">Use <code>table-striped</code> class to add zebra-striping to any table row within the &lt;tbody&gt;.</p> */}
                    <div className="live-preview">
                        <div className="table-responsive">
                            <Table className="table-striped table-nowrap align-middle mb-0">
                                <thead>
                                    <tr>

                                        <th scope="col">Rep</th>
                                        <th scope="col">Branch</th>
                                        <th scope="col">Revenue</th>
                                        <th scope="col">Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>J.Mwangi</td>
                                        <td>Nairobi</td>
                                        <td>342K</td>
                                        <td><span className="badge bg-success">94%</span></td>
                                    </tr>
                                    <tr>
                                        <td>A.Ochieng</td>
                                        <td>Nairobi</td>
                                        <td>298K</td>
                                        <td><span className="badge bg-success">88%</span></td>
                                    </tr>
                                    <tr>
                                        <td>F.Njoroge</td>
                                        <td>Nairobi</td>
                                        <td>271K</td>
                                        <td><span className="badge bg-info">81%</span></td>
                                    </tr>
                                    <tr>
                                        <td>P.Kariuki</td>
                                        <td>Nairobi</td>
                                        <td>244K</td>
                                        <td><span className="badge bg-danger">76%</span></td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                    </div>
                    <div className="d-none code-view">
                        <pre className="language-markup" style={{ "height": "275px" }}>
                            <code>
                                <StrippedRow />
                            </code>
                        </pre>
                    </div>
                </CardBody>
            </Card>
        </Col>
    );
}

export default CustomTableOne;
