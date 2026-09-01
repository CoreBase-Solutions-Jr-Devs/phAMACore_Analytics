import React from "react";
import CountUp from "react-countup";
import FeatherIcon from "feather-icons-react";
import { Card, CardBody, Col, Row } from "reactstrap";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resolveBranchName } from "../../helpers/branch_helper";

const Widgets = ({
  totalSpend = 0,
  budgetLeft = 0,
  activeSuppliers = 0,
  priceAlerts = 0,
  maverickSpend = 0,
  avgLeadTime = 0,
  formatAmount,
  rightClickBtn,
  isBranchView = false,
  branchDisplayName = "",
}) => {
  const { branchId } = useParams();
  const { branch, dateRange, startDate, endDate } = useSelector(
    (state) => state.PurchaseOrders.filters
  );
  const { branches = [], PurchaseOrders = [] } = useSelector(
    (state) => state.PurchaseOrders
  );

  const activeBranchCode = branchId ? Number(branchId) : (branch ? Number(branch) : null);
  const isBranchViewActive = isBranchView || !!branchId;
  const displayBranchName = branchDisplayName || (isBranchViewActive && activeBranchCode ? resolveBranchName(activeBranchCode, branches, PurchaseOrders) : "");

  const formatDisplay = (date) => date || "";

  return (
    <React.Fragment>
      
      <div className="d-flex align-items-center justify-content-between flex-wrap mb-1">

  {/* LEFT - TITLE */}
  <h4 className="card-title mb-0">
    KEY METRICS
  </h4>

  {/* CENTER - DATE RANGE */}
  <div className="d-flex align-items-center gap-2 flex-wrap">
    {isBranchViewActive && displayBranchName && (
      <>
        <span>Branch:</span>
        <strong className="text-primary">{displayBranchName}</strong>
        <span className="mx-1 text-muted">|</span>
      </>
    )}
    <span>Filtered From:</span>
    <strong>
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
        <Card className="card-animate w-100 h-80">     
        <CardBody className="p-2">
        <div className="d-flex justify-content-between align-items-center">
                                    <div>
            <p className=" font-medium mb-0">
              Total Spend
            </p>

            <h2 className="mt-4 ff-secondary fw-semibold text-success">
                                              <span className="counter-value">
              {/* <CountUp
                end={Number(totalSpend)}
                start={0}
                decimals={1}
                duration={4}
                formattingFn={(value) => formatAmount(value)}
              /> */}
              {formatAmount(Number(totalSpend))}
              </span>
            </h2>

            {/* <p className="text-muted mb-0 ">
              Budget:0.0M(0%)
            </p> */}
            </div>

                <div className="avatar-sm flex-shrink-0">
                            <span className="avatar-title bg-success-subtle rounded-circle fs-1">
                                <FeatherIcon icon="dollar-sign" className="text-success" />
                            </span>
                        </div>
                    </div>
          </CardBody>
        </Card>
      </Col>

      {/* Active Suppliers */}
      <Col  className="d-flex">
        <Card className="card-animate w-100 h-80">     
        <CardBody className="p-2">
        <div className="d-flex justify-content-between align-items-center">
                                    <div>
            <p className=" font-medium mb-0">
              Active Suppliers
            </p>

            <h2 className="mt-4 ff-secondary fw-semibold text-info">
              {/* <CountUp end={Number(activeSuppliers || 0)} start={0} duration={2} /> */}
              {Number(activeSuppliers || 0)}
            </h2>

 <p className="text-muted mb-0 ">
                0 approved, 0 secondary
            </p>
             </div>

                <div className="avatar-sm flex-shrink-0">
                            <span className="avatar-title bg-info-subtle rounded-circle fs-1">
                                <FeatherIcon icon="users" className="text-info" />
                            </span>
                        </div>
                    </div>
          </CardBody>
        </Card>
      </Col>

      {/* Price Alerts */}
      <Col className="d-flex">
         <Card className="card-animate h-80 w-100">     
        <CardBody className="p-2">
        <div className="d-flex justify-content-between align-items-center">
                                    <div>
 <p className=" font-medium mb-0">
                Price Alerts
            </p>

            <h2 className="mt-4 ff-secondary fw-semibold text-danger">
              <CountUp end={Number(priceAlerts || 0)} start={0} duration={2} />
            </h2>

 <p className="text-muted mb-0 ">
              Products up &gt;0%
            </p>
            
             </div>

                <div className="avatar-sm flex-shrink-0">
                            <span className="avatar-title bg-danger-subtle rounded-circle fs-1">
                                <FeatherIcon icon="alert-triangle" className="text-danger" />
                            </span>
                        </div>
                    </div>
          </CardBody>
        </Card>
      </Col>

      {/* Maverick Spend */}
      <Col className="d-flex">
        <Card className="card-animate w-100 h-80">     
        <CardBody className="p-2">
        <div className="d-flex justify-content-between align-items-center">
                                    <div>
 <p className=" font-medium mb-0">
              Maverick Spend
            </p>

            <h2 className="mt-4 ff-secondary fw-semibold text-warning">
              <CountUp
                end={Number(maverickSpend || 0)}
                start={0}
                decimals={1}
                duration={4}
              
              />
            </h2>

 <p className="text-muted mb-0 ">
              0% of total
            </p>
            </div>

                <div className="avatar-sm flex-shrink-0">
                            <span className="avatar-title bg-warning-subtle rounded-circle fs-1">
                                <FeatherIcon icon="trending-up" className="text-warning" />
                            </span>
                        </div>
                    </div>
          </CardBody>
        </Card>
      </Col>

      {/* Avg Lead Time */}
      <Col className="d-flex">
        <Card className="card-animate w-100 h-80">     
        <CardBody className="p-2">
        <div className="d-flex justify-content-between align-items-center">
                                    <div>
 <p className=" font-medium mb-0">
                Avg Lead Time
            </p>

            <h2 className="mt-4 ff-secondary fw-semibold text-success">
              {/* <CountUp
                end={Number(avgLeadTime || 0)}
                start={0}
                suffix=" days"
                decimals={1}
                duration={3}
              /> */}
              {Number(avgLeadTime || 0)}
            </h2>

 <p className="text-muted mb-0 ">
              Target: 0 days
            </p>
                </div>

                <div className="avatar-sm flex-shrink-0">
                            <span className="avatar-title bg-success-subtle rounded-circle fs-1">
                                <FeatherIcon icon="clock" className="text-success" />
                            </span>
                        </div>
                    </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
</React.Fragment>
  );
};

export default Widgets;