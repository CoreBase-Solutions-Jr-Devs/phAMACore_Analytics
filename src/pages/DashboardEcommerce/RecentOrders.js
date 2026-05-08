import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader, Col } from 'reactstrap';
import { recentOrders } from '../../common/data';

const RecentOrders = () => {
    return (
        <React.Fragment>
            
                <Card>
                    <CardHeader className="align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">OVERDUE INVOICES-ACTION REQUIRED TODAY</h4>
                        <div className="flex-shrink-0">
                            <button type="button" className="btn btn-soft-info btn-sm">
                                <i className="ri-file-list-3-line align-middle"></i> Generate Report
                            </button>
                        </div>
                    </CardHeader>

                    <CardBody>
                        <div className="table-responsive table-card">
                            <table className="table table-borderless table-centered align-middle table-nowrap mb-0">
                                <thead className="text-muted table-light">
                                    <tr>
                                        <th scope="col">Supplier-Invoice</th>
                                        <th scope="col">Amount</th>
                                        <th scope="col">Due date</th>
                                        <th scope="col">Days overdue</th>
                                        <th scope="col">Terms</th>
                                        <th scope="col">Action</th>
                                     
                                    </tr>
                                </thead>
                                <tbody>
  {(recentOrders || []).map((item, key) => (
    <tr key={key}>
      <td>
        <div className="fw-medium">
          {item.supplier}
          <div className="text-muted fs-12">{item.invoice}</div>
        </div>
      </td>

      <td className="fw-semibold">
        {item.amount}
      </td>

      <td>{item.dueDate}</td>

      <td className="text-danger">{item.daysOverdue}</td>

      <td>{item.terms}</td>

      <td>
        <span className={`badge bg-${item.actionClass}-subtle text-${item.actionClass}`}>
          {item.action}
        </span>
      </td>
    </tr>
  ))}
</tbody>
                            </table>
                        </div>
                         <hr className="my-2" />
                          <div>
                                                     <p className="mb-0 text-danger fw-semibold">
  Cosmos Ltd has flagged that they will switch PharmaDistrib to cash-on-delivery if 
  <strong> INV-COS-2026-018 (KES 180K)</strong> is not settled by May 3. 
  This will severely disrupt ARV supply continuity.
</p>
                          </div>

                    </CardBody>
                </Card>
        
        </React.Fragment>
    );
};

export default RecentOrders;