import React from 'react';
import { Card, CardBody, CardHeader } from 'reactstrap';
import { topCustomers } from '../../common/data/dashboardEcommerce';

const TopCustomers = () => {
    return (
        <React.Fragment>

            <Card className="border-0 shadow-sm">
                <CardHeader className="align-items-center d-flex bg-white border-0">
                    <h4 className="card-title mb-0 flex-grow-1 text-dark">
                        Top Customers — revenue (KES)
                    </h4>

                    <div className="flex-shrink-0">
                        <button
                            type="button"
                            className="btn btn-soft-primary btn-sm"
                        >
                            <i className="ri-bar-chart-line align-middle me-1"></i>
                            View Report
                        </button>
                    </div>
                </CardHeader>

                <CardBody className="bg-white">
                    <div className="table-responsive table-card">
                        <table className="table align-middle table-nowrap mb-0">
                            <thead className="table-light">
                                <tr className="text-muted">
                                    <th scope="col">CustomerName</th>
                                    <th scope="col">Branch</th>
                                    <th scope="col">Revenue</th>
                                    <th scope="col" className="text-end">Rate</th>
                                </tr>
                            </thead>

                            <tbody>
                                {(topCustomers || []).map((item, key) => (
                                    <tr key={key}>
                                        <td className="fw-semibold text-dark">
                                            {item.customerName}
                                        </td>

                                        <td className="text-muted">
                                            {item.branch}
                                        </td>

                                        <td className="fw-medium text-dark">
                                            {item.revenue}
                                        </td>

                                        <td className="text-end">
                                            <span
                                                className={`badge rounded-pill bg-${item.rateClass}-subtle text-${item.rateClass} px-3 py-2`}
                                            >
                                                {item.rate}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardBody>
            </Card>

        </React.Fragment>
    );
};

export default TopCustomers;