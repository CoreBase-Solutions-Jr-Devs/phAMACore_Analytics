import React, { useState, useEffect, useMemo } from "react";
import { Col, Container, Row } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import Widget from "./Widgets";
import BestSellingProducts from "./BestSellingProducts";
import RecentActivity from "./RecentActivity";
import RecentOrders from "./RecentOrders";
import Revenue from "./Revenue";
import SalesByLocations from "./SalesByLocations";
import Section from "./Section";
import StoreVisits from "./StoreVisits";
import TopSellers from "./TopSellers";
import SupplierSpend from "./SupplierSpend";
import FilterActions from "./FilterActions";
import { getPurchaseOrders } from "../../slices/dashboardPurchase/thunk";

const DashboardEcommerce = () => {
  document.title = "Purchases Dashboard | phAMACore Analytics";

  const [rightColumn, setRightColumn] = useState(true);
  const toggleRightColumn = () => {
    setRightColumn(!rightColumn);
  };

    const dispatch = useDispatch();
  
   const { PurchaseOrders = [], filters } = useSelector(
      (state) => state.PurchaseOrders);
  
  const handleApplyFilters = () => {
      console.log("APPLY CLICKED");
     dispatch(
        getPurchaseOrders({
          clientid: 1,
          startDate: filters.startDate  ,
          endDate: filters.endDate,
          branchcode:
            filters.branch === "All Branches" ? null : filters.branch,
        })
      );
    };
  
  useEffect(() => {
    dispatch(
      getPurchaseOrders({
        clientid: 1,
    startDate: filters.startDate,
          endDate: filters.endDate,
        branchcode:
          filters.branch === "All Branches"
            ? null
            : filters.branch,
      })
    );
  }, []);

  const branchMap = useMemo(() => {
     if (!filters.branch) return null;
    const map = {};
    PurchaseOrders.forEach((item) => {
      map[item.branch_ID] = item.branch_name;
    });
    return map;
  }, [PurchaseOrders]);

const formatAmount = (value) => {
  if (value === null || value === undefined) return "0";

  const abs = Math.abs(value);

  if (abs >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(1) + "B";
  }

  if (abs >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + "M";
  }

  if (abs >= 1_000) {
    return (value / 1_000).toFixed(1) + "K";
  }

  return value % 1 === 0 ? value.toFixed(0) : value.toFixed(2);
};

const totalSpend = PurchaseOrders.reduce(
  (sum, item) => sum + Number(item.total_lpo_value || 0),
  0
);

const activeSuppliers = new Set(
  PurchaseOrders.map((item) => item.supplier_id)
).size;

const avgLeadTime = PurchaseOrders.reduce((sum, item) => {
  const start = new Date(item.lpo_date);
  const end = new Date(item.expected_date);

  const diff = (end - start) / (1000 * 60 * 60 * 24);

  return sum + diff;
}, 0) / PurchaseOrders.length;

const spendBySupplier = PurchaseOrders.reduce((acc, item) => {
  const supplier = item.supplier_Name || "Unknown";
  const value = Number(item.total_lpo_value || 0);

  acc[supplier] = (acc[supplier] || 0) + value;

  return acc;
}, {});

const topSuppliers = Object.entries(spendBySupplier)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([name, value]) => ({ name, value }));

console.log("SPEND BY SUPPLIER", topSuppliers);

const spendByBranch = PurchaseOrders.reduce((acc, item) => {
  const branch = item.branch_name;
  acc[branch] = (acc[branch] || 0) + Number(item.total_lpo_value || 0);
  return acc;
}, {});

const branchData = Object.entries(spendByBranch).map(([name, value]) => ({
  name,
  value,
}));
// const ActualSpendCategories = Object.keys(totalSpend);

// const ActualSpendSeries = [
//   {
//     name: "Spend",
//     data: Object.values(totalSpend),
//   },
// ];
const getMonths = () => {
  return Array.from({ length: 12 }, (_, i) =>
    new Date(2000, i, 1).toLocaleString("default", {
      month: "short",
    })
  );
};

const MONTHS = getMonths();

const monthlySpendMap = MONTHS.reduce((acc, month) => {
  acc[month] = 0;
  return acc;
}, {});

PurchaseOrders.forEach((item) => {
  const date = new Date(item.lpo_date);

  const month = date.toLocaleString("default", {
    month: "short",
  });

  if (monthlySpendMap.hasOwnProperty(month)) {
    monthlySpendMap[month] += Number(item.total_lpo_value || 0);
  }
});

const ActualSpendCategories = MONTHS;

const ActualSpendSeries = [
  {
    name: "Actual Spend",
    type: "bar",
    data: MONTHS.map((month) =>
      Number((monthlySpendMap[month] / 1_000_000).toFixed(2))
    ),
  },
  {
    name: "Trend",
    type: "line",
    data: MONTHS.map((month) =>
      Number(((monthlySpendMap[month] * 1.1) / 1_000_000).toFixed(2))
    ),
  },
];

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Row>
            <Col>
              <div className="h-100">
                <FilterActions onApply={handleApplyFilters}/>
                {/* <Section rightClickBtn={toggleRightColumn} /> */}
                <Row>
                  <Widget formatAmount={formatAmount} totalSpend={totalSpend} activeSuppliers={activeSuppliers} avgLeadTime={avgLeadTime} branchMap={branchMap}/>
                </Row>
                     <Row>
                  <Col xl={6}>
                     <StoreVisits/>
                  </Col>
                  <Col xl={6}>
          <SalesByLocations data={branchData} totalSpend={totalSpend} formatAmount={formatAmount}/>
                  </Col>
                </Row>
                 <Row>
                  <Col xl={6}>
<SupplierSpend
  supplierData={topSuppliers}
  formatAmount={formatAmount}
/>             
</Col>
<Col xl={6}>
<RecentOrders data={PurchaseOrders} />
</Col>
   </Row>
           
                <Row>
                  <Col xl={12}>
                    <Revenue  categories={ActualSpendCategories}
  series={ActualSpendSeries}  formatAmount={formatAmount}/>
                  </Col>
                 
                </Row>
                {/* <Row>
                  <BestSellingProducts />
                  <TopSellers />
                </Row> */}
                <Row>
                <Col xl={12}>
                 {/* <RecentOrders /> */}
                 </Col>
                 
                </Row>
              </div>
            </Col>
            <RecentActivity rightColumn={rightColumn} hideRightColumn={toggleRightColumn} />
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default DashboardEcommerce;
   