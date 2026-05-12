
import React from 'react';
import { StrippedRow } from '../../../Tables/BasicTables/BasicTablesCode';
import { Card, CardBody, Col, Table } from 'reactstrap';
import PreviewCardHeader from '../../../../Components/Common/PreviewCardHeader';

const CustomTableTwo = () => {
    return (
        <Col>
            <Card>
                <PreviewCardHeader title="Top Debtors" />
                <CardBody>
                    {/* <p className="text-muted">Use <code>table-striped</code> class to add zebra-striping to any table row within the &lt;tbody&gt;.</p> */}
                    <div className="live-preview">
                        <div className="table-responsive">
                            <Table className="table-striped table-nowrap align-middle mb-0">
                                {/* <thead>
                                    <tr>
                                        <th scope="col">Debtor</th>
                                        <th scope="col">Branch</th>
                                        <th scope="col">Amount</th>
                                        <th scope="col">Rate</th>
                                    </tr>
                                </thead> */}
                                <tbody>
                                    <tr>
                                        <td>Savanna Traders Ltd</td>
                                        <td>4320</td>
                                    </tr>
                                    <tr>
                                        <td>Rift Valley Enterprises</td>
                                        <td>3875</td>
                                    </tr>
                                    <tr>
                                        <td>Lakewood Supplies Co</td>
                                        <td>2640</td>
                                    </tr>
                                    <tr>
                                        <td>Horizon Agro Holdings</td>
                                        <td>1980</td>
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

export default CustomTableTwo;
