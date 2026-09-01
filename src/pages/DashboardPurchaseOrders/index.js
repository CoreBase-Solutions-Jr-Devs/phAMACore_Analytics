import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Widget from "./Widgets";
import StoreVisits from "./StoreVisits";
import SalesByLocations from "./SalesByLocations";
import YearToDatePurchases from "./YearToDatePurchases";
import MonthToDatePurchases from "./MonthToDatePurchases";
import SupplierSpendBottom from "./SupplierSpendBottom";
import FilterActions from "./FilterActions";
import SupplierSpend from "./SupplierSpend";
import RecentOrders from "./RecentOrders";
import BestSellingProducts from "./BestSellingProducts";

import BreadCrumb from "../../Components/Common/BreadCrumb";
import RecentActivity from "./RecentActivity";

import {
  getPurchaseOrders,
  getActualSpend,
  getDailySpend,
  fetchBranches,
} from "../../slices/dashboardPurchase/thunk";

import {
  clearPurchaseOrdersData,
  setBranch,
} from "../../slices/dashboardPurchase/reducer";

import usePurchaseOrders from "../../Components/Hooks/usePurchaseOrders";
import { resolveBranchName, saveActiveBranch } from "../../helpers/branch_helper";

const DashboardPurchaseOrders = () => {
  document.title = "Purchases Dashboard | phAMACore Analytics";

    const { branchId } = useParams();
    
const branchCode = branchId ? Number(branchId) : null;
const isBranchView = !!branchCode;

    const dispatch = useDispatch();
    const navigate = useNavigate();
  
     const [rightColumn, setRightColumn] = useState(false);
  const toggleRightColumn = () => {
    setRightColumn(!rightColumn);
  };

   const { PurchaseOrders = [], ActualSpend = [], DailySpend = [], branches = [], filters } = useSelector(
      (state) => state.PurchaseOrders);

  const branchDisplayName = isBranchView
    ? resolveBranchName(branchCode, branches, PurchaseOrders)
    : "";
  
      const {
  formatAmount,
  totalSpend,
  activeSuppliers,
  avgLeadTime,
  topSuppliers,
  top2Suppliers,
  branchData,
  actualSpendChart,
  monthToDateChart,
  OverdueAccounts,
  bottomSuppliers,
} = usePurchaseOrders(
  PurchaseOrders,
  ActualSpend,
  DailySpend
);

  // Sync URL branchId into Redux filters and persist active branch
  useEffect(() => {
    dispatch(setBranch(branchCode));
    if (branchCode) {
      saveActiveBranch("purchase", branchCode);
    }
  }, [dispatch, branchCode]);

  // Fetch branches once on mount
  useEffect(() => {
    dispatch(fetchBranches({ clientid: 1 }));
  }, [dispatch]);
 
  useEffect(() => {
    dispatch(
      getPurchaseOrders({
        clientid: 1,
        startDate: filters.startDate,
        endDate: filters.endDate,
        branchcode: branchCode || null,  
      })
    );
    dispatch(
      getActualSpend({
        clientid: 1,
        startDate: new Date(new Date().getFullYear(), 0, 1).toLocaleDateString("en-GB"),
        endDate: new Date().toLocaleDateString("en-GB"),
        branchcode: branchCode || null,  
      })
    );
    dispatch(
      getDailySpend({
        clientid: 1,
        startDate: new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        ).toLocaleDateString("en-GB"),
        endDate: new Date().toLocaleDateString("en-GB"),
        branchcode: branchCode || null,
      })
    );
  }, [
    dispatch,
    branchCode,
    filters.startDate,
    filters.endDate,
  ]);

    useEffect(() => {
      return () => {
        dispatch(clearPurchaseOrdersData());
      };
    }, [dispatch]);
    
    const handleApplyFilters = () => {
      setRightColumn(false);

      if (filters.branch) {
        navigate(`/dashboard-purchase-orders/branch/${filters.branch}`);
      } else {
        navigate("/dashboard-purchase-orders");
      }
    };

 
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
            <BreadCrumb
              title="Purchases"
              pageTitle="Dashboards"
              subtitle={isBranchView ? branchDisplayName : undefined}
            />
          <Row>
            <Col>
              <div className="h-100">
                <Row>
                  <Widget
                    rightClickBtn={toggleRightColumn}
                    formatAmount={formatAmount}
                    totalSpend={totalSpend}
                    activeSuppliers={activeSuppliers}
                    avgLeadTime={avgLeadTime}
                    isBranchView={isBranchView}
                    branchDisplayName={branchDisplayName}
                  />
                </Row>
             <Row>

            <Col xl={6}>

              {isBranchView ? (

                <StoreVisits
                  data={branchData}
                />

              ) : (

                <StoreVisits
                  data={branchData}
                />

              )}

            </Col>


            <Col xl={6}>
              {isBranchView ? (

                <SupplierSpendBottom
                  supplierData={
                    bottomSuppliers
                  }

                  formatAmount={
                    formatAmount
                  }
                />

              ) : (

                <SalesByLocations
                  data={branchData}

                  totalSpend={
                    totalSpend
                  }

                  formatAmount={
                    formatAmount
                  }
                />

              )}

            </Col>
              <Row>
                  <Col xl={6}>
<SupplierSpend
  supplierData={topSuppliers}
  formatAmount={formatAmount}
top2Suppliers ={top2Suppliers}
totalSpend={totalSpend}
/>             
</Col>
<Col xl={6}>
<RecentOrders data={PurchaseOrders}  OverdueAccounts={OverdueAccounts}/>
</Col>
   </Row>
          </Row>
           
                <Row>
                  <Col xl={6}>
                   <YearToDatePurchases
  categories={actualSpendChart.categories}
  series={actualSpendChart.series}
  formatAmount={formatAmount}
/>
                 </Col>
                      <Col xl={6}>

<MonthToDatePurchases 
categories={monthToDateChart.categories}
  series={monthToDateChart.series}
  formatAmount={formatAmount}
  />
                 </Col>
                </Row>
               
            
              </div>
            </Col>
                            <FilterActions onApply={handleApplyFilters} rightColumn={rightColumn} hideRightColumn={toggleRightColumn}/>

          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default DashboardPurchaseOrders;
   