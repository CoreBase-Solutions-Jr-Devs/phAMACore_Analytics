import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import BranchOrderFillRateTable from "../BranchOrderFillRate/BranchOrderFillRateTable";
import BranchOrder from "../BranchOrderFillRate/BranchOrder";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import {
  getKPIBranchOrderFillRate,
} from "../../../slices/dashboardPurchase/BranchOrderFillRate/thunk";
import FilterActions from "../../../Components/Common/FilterActions";
import {
  setBranch,
  setDateRange,
  setStartDate,
  setEndDate,
} from "../../../slices/dashboardPurchase/BranchOrderFillRate/reducer";
 import { clearBranchOrderFillRateData } from "../../../slices/dashboardPurchase/BranchOrderFillRate/reducer";
import usePurchaseOrders from "../../../Components/Hooks/usePurchaseOrders";

const BranchOrderFill = () => {
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
KPIBranchOrderFillRateSummary = [],
KPIBranchOrderFillRateBranchOFR = [],
KPIBranchOrderFillRateOrderDrilldown = [],
KPIBranchOrderFillRateTopShortages = [],
loading,
  error,
  filters,
} = useSelector((state) => state.branchOrderFillRate);
const {
  BranchOrderFillRateSummaryData,
  BranchOrderFillRateBranchOFRData,
  BranchOrderFillRateOrderDrilldownData,
  BranchOrderFillRateTopShortagesData,

} = usePurchaseOrders(
  [], // PurchaseOrders
  [], // KPIPurchases
  [], // KPISummary
   [], // KPICategory,
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
KPIBranchOrderFillRateSummary,
KPIBranchOrderFillRateBranchOFR,
KPIBranchOrderFillRateOrderDrilldown,
KPIBranchOrderFillRateTopShortages,

  filters
);

useEffect(() => {
    const params = {
         clientid: 1,
      
     branchcode: filters.branch,
       startDate:  filters.startDate,
     endDate:  filters.endDate,
     TopN: 500,
     status:"All"
    }
   dispatch(   
        getKPIBranchOrderFillRate({ 
             ...params,
groupBy: "SUMMARY",
        }),
      );
       dispatch(   
        getKPIBranchOrderFillRate({ 
             ...params,
groupBy: "BRANCH_OFR",
        }),
      );
       dispatch(   
        getKPIBranchOrderFillRate({ 
             ...params,
groupBy: "ORDER_DRILLDOWN",
        }),
      );
       dispatch(   
        getKPIBranchOrderFillRate({ 
             ...params,
groupBy: "TOP_SHORTAGES",
        }),
      );
}, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearBranchOrderFillRateData());
    };
  }, [dispatch]);

const handleApplyFilters = () => {
 
      const params = {
         clientid: 1,     
     branchcode: filters.branch,
       startDate:  filters.startDate,
     endDate:  filters.endDate,
     TopN: 500,
     status:"All"
    }
   dispatch(   
        getKPIBranchOrderFillRate({ 
             ...params,
groupBy: "SUMMARY",
        }),
      );
       dispatch(   
        getKPIBranchOrderFillRate({ 
             ...params,
groupBy: "BRANCH_OFR",
        }),
      );
       dispatch(   
        getKPIBranchOrderFillRate({ 
             ...params,
groupBy: "ORDER_DRILLDOWN",
        }),
      );
       dispatch(   
        getKPIBranchOrderFillRate({ 
             ...params,
groupBy: "TOP_SHORTAGES",
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
                      <BranchOrder

                          rightClickBtn={toggleRightColumn}
                          selectedBranchName={selectedBranchName}
                      BranchOrderFillRateSummaryData={BranchOrderFillRateSummaryData}
                        error={error}
                        loading={loading}
                      />
            </Col>
            </Row>
                <Row>                  
                  
                    <Col> 
                        
                    <BranchOrderFillRateTable
  BranchOrderFillRateBranchOFR={BranchOrderFillRateBranchOFRData}
  BranchOrderFillRateOrderDrilldown={BranchOrderFillRateOrderDrilldownData}
  BranchOrderFillRateTopShortages={BranchOrderFillRateTopShortagesData}
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

export default BranchOrderFill;
