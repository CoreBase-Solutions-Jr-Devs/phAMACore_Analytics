import React from "react";
import CountUp from "react-countup";
import FeatherIcon from "feather-icons-react";
import { Card, CardBody, Col, Row } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";

const Widgets = ({
  rightClickBtn,
  formatAmount,
  totalSpend = 0,
  budgetLeft = 0,
  activeSuppliers = 0,
  priceAlerts = 0,
  maverickSpend = 0,
  maverickSpendPercentage = 0,
  avgLeadTime = 0,
}) => {
   const { branch, dateRange, startDate, endDate } = useSelector(
          (state) => state.PurchaseOrders.filters
        );
          const formatDisplay = (date) => date || "";

  //      const branchName =
  // !branch || branch === "All Branches"
  //   ? "All Branches"
  //   : branchMap?.[branch] || "Unknown Branch";
  return (
    <React.Fragment>
      
      <div className="d-flex align-items-center justify-content-between flex-wrap mb-1">

  {/* LEFT - TITLE */}
  <h4 className="card-title mb-0">
    KEY METRICS
    {/* {branchName !== "All Branches" && ` - ${branchName}`} */}
  </h4>

  {/* CENTER - DATE RANGE */}
  <div className="d-flex align-items-center gap-2 ">
    <span>Filtered From:</span>
    <strong >
      {formatDisplay(startDate)}</strong> to <strong>
      {formatDisplay(endDate)}
    </strong>
    
  </div>

  {/* RIGHT - BUTTON */}
  <button
    type="button"
    className="btn btn-caramel d-flex align-items-center gap-2 layout-rightside-btn"
    onClick={rightClickBtn}
  >
    <i className="ri-filter-fill"></i>
    Filter
  </button>

</div>

 <Row className="g-2 mb-2 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5">
      {/* Total Spend */}
      <Col className="d-flex">
        <Card className="card-animate h-80 w-100">
    <CardBody className="p-2 d-flex flex-column">
                                    <div>
            <p className=" font-medium mb-0">
              Total Spend
            </p>

            <h2 className="mt-2 ff-secondary fw-semibold text-success">
                                              <span className="counter-value">
              {/* <CountUp
                end={Number(totalSpend)}
                start={0}
                decimals={1}
                duration={4}
                formattingFn={(value) => formatAmount(value)}
              /> */}
KES {Number(totalSpend || 0).toLocaleString("en-KE")}
              </span>
            </h2>
</div>
            <p className="text-muted mb-0 mt-auto">
 Tax inclusive
            </p>
            

                {/* <div className="avatar-sm flex-shrink-0">
                            <span className="avatar-title bg-success-subtle rounded-circle fs-1">
                                <FeatherIcon icon="dollar-sign" className="text-success" />
                            </span>
                        </div> */}
                    
          </CardBody>
        </Card>
      </Col>

      {/* Active Suppliers */}
      <Col  className="d-flex">
         <Card className="card-animate h-80 w-100">
    <CardBody className="p-2 d-flex flex-column">
       
                                    <div>
            <p className=" font-medium mb-0">
              Active Suppliers
            </p>

            <h2 className="mt-2 ff-secondary fw-semibold text-info">
              {/* <CountUp end={Number(activeSuppliers || 0)} start={0} duration={2} /> */}
              {Number(activeSuppliers || 0)}
            </h2>
 </div>
 <p className="text-muted mb-0 mt-auto">
                 Suppliers with purchases
            </p>
           

                {/* <div className="avatar-sm flex-shrink-0">
                            <span className="avatar-title bg-info-subtle rounded-circle fs-1">
                                <FeatherIcon icon="users" className="text-info" />
                            </span>
                        </div> */}
                   
          </CardBody>
        </Card>
      </Col>

      {/* Price Alerts */}
      <Col className="d-flex">
           <Card className="card-animate h-80 w-100">
    <CardBody className="p-2 d-flex flex-column">
        
                                    <div>
 <p className=" font-medium mb-0">
                Price Alerts
            </p>

            <h2 className="mt-2 ff-secondary fw-semibold text-danger">
         {Number(priceAlerts || 0)}
            </h2>
</div>
 <p className="text-muted mb-0 mt-auto">
             Recent price changes
            </p>
            
            

                {/* <div className="avatar-sm flex-shrink-0">
                            <span className="avatar-title bg-danger-subtle rounded-circle fs-1">
                                <FeatherIcon icon="alert-triangle" className="text-danger" />
                            </span>
                        </div> */}
                    
          </CardBody>
        </Card>
      </Col>

    {/* Maverick Spend */}
<Col className="d-flex">
  <Card className="card-animate h-80 w-100">
    <CardBody className="p-2 d-flex flex-column">
      <div>
        <p className="font-medium mb-0">
          Maverick Spend
        </p>

        <h2 className="mt-2 ff-secondary fw-semibold text-warning">
          KES {Number(maverickSpend || 0).toLocaleString("en-KE")}
        </h2>
      </div>

      <p className="text-muted mb-0 mt-auto">
        {Number(maverickSpendPercentage || 0).toFixed(2)}% of total
      </p>
    </CardBody>
  </Card>
</Col>

{/* Avg Lead Time */}
<Col className="d-flex">
  <Card className="card-animate h-80 w-100">
    <CardBody className="p-2 d-flex flex-column">
      <div>
        <p className="font-medium mb-0">
          Avg Lead Time
        </p>

        <h2 className="mt-2 ff-secondary fw-semibold text-success">
          {Number(avgLeadTime || 0).toFixed(1)} days
        </h2>
      </div>

      <p className="text-muted mb-0 mt-auto">
        Delivery time
      </p>
    </CardBody>
  </Card>
</Col>
    </Row>
</React.Fragment>
  );
};

export default Widgets;