import React from 'react';
import { Card, CardHeader, CardBody, Col, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap';
import { StoreVisitsCharts } from './DashboardEcommerceCharts';

const StoreVisits = ({ data= [] }) => {
    return (
        <React.Fragment>
           
                <Card className="card-height-100">
                    <CardHeader className="align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">Spend by product category</h4>
                     
                    </CardHeader>
                   <CardBody>
                            {data.length === 0 ? (
          <div className="text-center py-5">
            <h6 className="text-muted mb-2">
            No product category data available
            </h6>
          </div>
        ) : (
          <>
              <div className="text-center py-5">
            <h6 className="text-muted mb-2">
            No product category data available
            </h6>
          </div>
                            {/* <StoreVisitsCharts 
                            dataColors='["--vz-primary", "--vz-success", "--vz-warning", "--vz-danger", "--vz-info"]'
                            /> */}
                     
                       </>
        )}
                    </CardBody>
                </Card>
           
        </React.Fragment>
    );
};

export default StoreVisits;