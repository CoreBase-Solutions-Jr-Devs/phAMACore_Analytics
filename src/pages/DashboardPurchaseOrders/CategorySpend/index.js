import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import SpendTable from "../CategorySpend/SpendTable";
import Category from "../CategorySpend/Category";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import {
  getKPIPurchases,
} from "../../../slices/dashboardPurchase/thunk";
import FilterActions from "../../../Components/Common/FilterActions";
import {
  setBranch,
  setDateRange,
  setStartDate,
  setEndDate,
} from "../../../slices/dashboardPurchase/CategorySpend/reducer";
 import { clearCategorySpendData } from "../../../slices/dashboardPurchase/CategorySpend/reducer";
import usePurchaseOrders from "../../../Components/Hooks/usePurchaseOrders";

const CategorySpend = () => {
  document.title = "Purchases Dashboard | phAMACore Analytics"

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [rightColumn, setRightColumn] = useState(false);

  const toggleRightColumn = () => {
    setRightColumn(!rightColumn);
  };

  const [selectedBranchName, setSelectedBranchName] =
    useState("All Branches");

const {
  KPICategory = [],
loading,
  error,
  filters,
} = useSelector((state) => state.categorySpend);

const {
 spendByCategory,
 categoryTotals
} = usePurchaseOrders(
  [], // PurchaseOrders
  [], // KPIPurchases
  [], // KPISummary
   KPICategory,
  [], // KPISupplier
  [], // KPIBranch
  [], // KPIMonthly
  [], // KPIType

  [], // KPIMaverickSpend
  [], // KPIMaverickSpendSummary
  [], // KPIMaverickSpendSupplier
  [], // KPIMaverickSpendBranch
  [], // KPIMaverickSpendOffPOInvoices
  [], // KPIMaverickSpendPOPriceVariance

  [], // KPIPriceAlerts
  [], // KPIPriceAlertsSummary
  [], // KPIPriceAlertsItems
  [], // KPIPriceAlertsHistory

  [], // BestPricePerSupplier

  [], // KPILeadTime
  [], // KPILeadTimeSummary
  [], // KPILeadTimeSupplier
  [], // KPILeadTimePODetails
  [], // KPILeadTimeMonth
  [], // KPILeadTimeBranch

  [], // GoodsReceived
  [], // LastYearGoodsReceived

  [], // ActualSpend
  [], // ActualSpendSummary
  [], // ActualSpendCategory
  [], // ActualSpendSupplier
  [], // ActualSpendBranch
  [], // ActualSpendMonthly
  [], // ActualSpendType

  [], // DailySpend
  [], // DailySpendSummary
  [], // DailySpendCategory
  [], // DailySpendSupplier
  [], // DailySpendBranch
  [], // DailySpendMonthly
  [], // DailySpendType

  [], // LastYearActualSpend
  [], // LastYearActualSpendSummary
  [], // LastYearActualSpendCategory
  [], // LastYearActualSpendSupplier
  [], // LastYearActualSpendBranch
  [], // LastYearActualSpendMonthly
  [], // LastYearActualSpendType

  [], // LastYearDailySpend
  [], // LastYearDailySpendSummary
  [], // LastYearDailySpendCategory
  [], // LastYearDailySpendSupplier
  [], // LastYearDailySpendBranch
  [], // LastYearDailySpendMonthly
  [], // LastYearDailySpendType

[], //kpiOverdueAccounts,
  filters
);

useEffect(() => {

   dispatch(
        getKPIPurchases({
          clientid: 1,
      GroupBy: "CATEGORY",
     branchcode: filters.branch,
       startDate:  filters.startDate,
     endDate:  filters.endDate,
     TopN: 0,
        }),
      );
}, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearCategorySpendData());
    };
  }, [dispatch]);

const handleApplyFilters = () => {
 
    dispatch(
         getKPIPurchases({
           clientid: 1,
      groupBy: "CATEGORY",
     branchcode: filters.branch,
       startDate:  filters.startDate,
     endDate:  filters.endDate,
     TopN: 0,
         }),
       );
};
  // const selectedBranchName =
  //   filters.branch == null || filters.branch === ""
  //     ? "All Branches"
  //     : (salesBranch || []).find(
  //         (m) => Number(m.branch_ID) === Number(filters.branch),
  //       )?.branch_name || "";
        
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb
            title="Purchases"
            pageTitle="Dashboards"
                subtitle= {selectedBranchName}

          />
          <Row>
            
              <Col xl={12}>
                      <Category
                          rightClickBtn={toggleRightColumn}
                          selectedBranchName={selectedBranchName}
                      categoryTotals={categoryTotals}
                        error={error}
                        loading={loading}
                      />
            </Col>
            </Row>
                <Row>                  
                  
                    <Col> 
                        
                      <SpendTable
                        data={spendByCategory}
                        // totalSpend={totalSpend}
                        error={error}
                        loading={loading}
                      />
                 
                          </Col>                             
          <FilterActions
                  branch={filters.branch}
                    dateRange={filters.dateRange}
                    startDate={filters.startDate}
                    endDate={filters.endDate}
                    onBranchChange={(value) =>
                      dispatch(setBranch(value === "" ? null : Number(value)))
                    }
                      onBranchNameChange={setSelectedBranchName}

                    onDateRangeChange={(value) =>
                      dispatch(setDateRange(value))
                    }
                    onStartDateChange={(value) =>
                      dispatch(setStartDate(value))
                    }
                    onEndDateChange={(value) =>
                      dispatch(setEndDate(value))
                    }
            onApply={handleApplyFilters}
            rightColumn={rightColumn}
            hideRightColumn={toggleRightColumn}
          />
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default CategorySpend;
