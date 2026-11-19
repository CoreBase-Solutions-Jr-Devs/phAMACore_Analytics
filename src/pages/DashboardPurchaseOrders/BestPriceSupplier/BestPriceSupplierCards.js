import React, { useMemo } from "react";
import {
  Card,
  CardBody,
  Row,
  Col,
  Table,
  Badge,
} from "reactstrap";
import { useSelector } from "react-redux";

const BestPricePerSupplierCards = ({
  BestPricePerSupplierSupplierScorecardData = [],
  selectedBranchName,
  error,
  loading,
  rightClickBtn,
}) => {
  const { startDate, endDate } = useSelector(
    (state) => state.consolidatedLPOReview?.filters || {},
  );

  const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatPercent = (value) =>
    `${Number(value || 0).toFixed(2)}%`;

  // Calculate summary totals across all suppliers
const supplierScorecardSummary = useMemo(() => {
  const data = BestPricePerSupplierSupplierScorecardData || [];

  // Total unique suppliers
  const totalSuppliers = new Set(
    data.map((item) => item.supplier_id).filter(Boolean)
  ).size;

  // Total items tracked across suppliers
  const totalItemsTracked = data.reduce(
    (sum, item) => sum + Number(item.total_items_supplied || 0),
    0
  );

  // Total best price wins
  const totalBestPriceItems = data.reduce(
    (sum, item) => sum + Number(item.best_price_items_count || 0),
    0
  );

  // Overall win rate
  const overallWinRate =
    totalItemsTracked > 0
      ? (totalBestPriceItems / totalItemsTracked) * 100
      : 0;

  // Top supplier by best price wins
  const topSupplier = data.reduce((best, item) => {
    if (
      !best ||
      Number(item.best_price_items_count || 0) >
        Number(best.best_price_items_count || 0)
    ) {
      return item;
    }

    return best;
  }, null);

  // Total premium items
  const totalPremiumItems = data.reduce(
    (sum, item) => sum + Number(item.premium_items_count || 0),
    0
  );

  // Weighted average price premium
  const weightedAvgPriceGap =
    totalPremiumItems > 0
      ? data.reduce(
          (sum, item) =>
            sum +
            Number(item.avg_premium_perc_when_higher || 0) *
              Number(item.premium_items_count || 0),
          0
        ) / totalPremiumItems
      : 0;

  // Total potential savings
  const totalPotentialSavings = data.reduce(
    (sum, item) =>
      sum + Number(item.total_savings_lost_to_premium || 0),
    0
  );

  // Total supplier spend (excluding tax)
  const totalSpend = data.reduce(
    (sum, item) => sum + Number(item.total_spend_exc || 0),
    0
  );

  return {
    totalSuppliers,
    totalItemsTracked,
    totalBestPriceItems,
    overallWinRate,
    topSupplier,
    weightedAvgPriceGap,
    totalPotentialSavings,
    totalSpend,
  };
}, [BestPricePerSupplierSupplierScorecardData]);

  // Sort suppliers by highest procurement spend
  const sortedSuppliers = useMemo(() => {
    const data = Array.isArray(BestPricePerSupplierSupplierScorecardData)
      ? BestPricePerSupplierSupplierScorecardData
      : [];

    return [...data].sort(
      (a, b) =>
        Number(b.total_spend_exc || 0) -
        Number(a.total_spend_exc || 0),
    );
  }, [BestPricePerSupplierSupplierScorecardData]);

  return (
  
      <React.Fragment>
        {/* Page Header */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
          <h4 className="card-title mb-0">
            KEY METRICS
          </h4>

          <div className="d-flex align-items-center gap-2">
            <span>Filtered From:</span>
            <strong>{startDate || "-"}</strong>
            to
            <strong>{endDate || "-"}</strong>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span>Selected Branch:</span>
            <strong>{selectedBranchName || "All Branches"}</strong>
          </div>

          <div className="d-flex align-items-center gap-2 no-print">
            <button
              type="button"
              className="btn btn-caramel d-flex align-items-center gap-2 layout-rightside-btn"
              onClick={rightClickBtn}
            >
              <i className="ri-filter-fill"></i>
              Filter
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div
              className="spinner-border text-primary"
              role="status"
              aria-label="Loading best price supplier metrics"
            ></div>
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <p className="text-danger mb-0">{error}</p>
          </div>
        ) : (
          <>     
            <Row className="g-2 mb-3 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5">
              <Col className="d-flex">
                <Card className="card-animate w-100 h-80">
                  <CardBody className="p-2 d-flex flex-column">
                    <p className="font-medium mb-0">Suppliers Compared</p>

                    <h5 className="mt-1 ff-secondary fw-semibold text-primary">
                   {supplierScorecardSummary.totalSuppliers}
                    </h5>

                    <p className="mb-0 text-muted mt-auto">
                      Suppliers with prices
                    </p>
                  </CardBody>
                </Card>
              </Col>

              <Col className="d-flex">
                <Card className="card-animate w-100 h-80">
                  <CardBody className="p-2 d-flex flex-column">
                    <p className="font-medium mb-0">Total Spend</p>

                    <h5 className="mt-1 ff-secondary fw-semibold text-info">
                   KES {formatAmount(supplierScorecardSummary.totalSpend)}
                    </h5>

                    <p className="mb-0 text-muted mt-auto">
                      Excluding Tax
                    </p>
                  </CardBody>
                </Card>
              </Col>

  <Col className="d-flex">
                <Card className="card-animate w-100 h-80">
                  <CardBody className="p-2 d-flex flex-column">
                    <p className="font-medium mb-0">Potential Savings</p>

                    <h5 className="mt-1 ff-secondary fw-semibold text-warning">
                     KES {formatAmount(supplierScorecardSummary.totalPotentialSavings)}
                    </h5>

                    <p className="mb-0 text-muted mt-auto">
                     Savings at best prices
                    </p>
                  </CardBody>
                </Card>
              </Col>
              
              <Col className="d-flex">
                <Card className="card-animate w-100 h-80">
                  <CardBody className="p-2 d-flex flex-column">
                    <p className="font-medium mb-0">Best Price Items</p>

                    <h5 className="mt-1 ff-secondary fw-semibold text-success">
                                        {supplierScorecardSummary.totalBestPriceItems}

                    </h5>

                    <p className="mb-0 text-muted mt-auto">
Items with a best price                    </p>
                  </CardBody>
                </Card>
              </Col>

              <Col className="d-flex">
                <Card className="card-animate w-100 h-80">
                  <CardBody className="p-2 d-flex flex-column">
                    <p className="font-medium mb-0">Top Supplier</p>

                    <h5 className="mt-1 ff-secondary fw-semibold text-success">
                 <small>{supplierScorecardSummary.topSupplier?.supplier_name || "N/A"}</small> 
                    </h5>

                    <p className="mb-0 text-muted mt-auto">
                     Most best prices
                    </p>
                  </CardBody>
                </Card>
              </Col>

              {/* <Col className="d-flex">
                <Card className="card-animate w-100 h-80">
                  <CardBody className="p-2 d-flex flex-column">
                    <p className="font-medium mb-0">Avg Price Gap</p>

                    <h5 className="mt-1 ff-secondary fw-semibold text-primary">
                    {formatPercent(supplierScorecardSummary.weightedAvgPriceGap)}
                    </h5>

                    <p className="mb-0 text-muted mt-auto">
                     Best vs average price
                    </p>
                  </CardBody>
                </Card>
              </Col> */}

             {/* <Col className="d-flex">
                <Card className="card-animate w-100 h-80">
                  <CardBody className="p-2 d-flex flex-column">
                    <p className="font-medium mb-0">Best Price Rate</p>

                    <h5 className="mt-1 ff-secondary fw-semibold text-primary">
                   {formatPercent(supplierScorecardSummary.weightedAvgPriceGap)}
                    </h5>

                    <p className="mb-0 text-muted mt-auto">
                    Items at lowest price
                    </p>
                  </CardBody>
                </Card>
              </Col> */}
            </Row>                
          </>
        )}
      </React.Fragment>
 
  );
};

export default BestPricePerSupplierCards;