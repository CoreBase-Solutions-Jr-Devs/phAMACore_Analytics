import React from 'react'
import { Card, CardBody, CardHeader, Row, Col, Spinner } from "reactstrap";

const VatBreakdown = () => {
  return (
    <div>      <Card
            className="card-height-100"
            id="sales-branch-performance-card"
        >
            <CardHeader className="align-items-center d-flex justify-content-between flex-wrap gap-2">
                <h4 className="card-title mb-0 flex-grow-1">
                    Sales Composition
                </h4>
            </CardHeader>

            <CardBody>
      <table className="table table-borderless table-centered table-nowrap mb-0">
  <thead className="text-muted table-light sticky-top">
    <tr>
      <th>VAT Breakdown</th>
      <th className="text-end">Amount (KES)</th>
    </tr>
  </thead>

  <tbody>


      <>
        <tr>
          <td>
            <div className="fw-medium">Sales Inclusive of VAT</div>
            <small className="text-muted">
              Total sales including VAT
            </small>
          </td>
          <td className="text-end fw-semibold">
     0
          </td>
        </tr>

        <tr>
          <td>
            <div className="fw-medium">Output VAT</div>
            <small className="text-muted">
              VAT charged on sales
            </small>
          </td>
          <td className="text-end text-warning fw-semibold">
       0
          </td>
        </tr>

        <tr>
          <td>
            <div className="fw-medium">Net Sales Excluding VAT</div>
            <small className="text-muted">
              Sales before VAT
            </small>
          </td>
          <td className="text-end text-success fw-semibold">
           0
          </td>
        </tr>
      </>
    
  </tbody>
</table>

<div className="border-top mt-2 pt-2 px-3">
  <small className="text-muted">
    Output VAT is VAT charged on sales. It is not the final VAT payable,
    which may depend on allowable input VAT and other applicable adjustments.
  </small>
</div>
  </CardBody>
        </Card>
    </div>
  )
}

export default VatBreakdown
