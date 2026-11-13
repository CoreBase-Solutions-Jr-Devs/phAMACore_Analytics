import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AgeingCards from "../SupplierAgeing/AgeingCards";
import SupplierAgeingTable from "../SupplierAgeing/SupplierAgeingTable";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import {
  getKPIOverdueAccounts,
} from "../../../slices/dashboardSales/thunk";
import FilterActions from "../../../Components/Common/FilterActions";
import {
  setBranch,
  setDateRange,
  setStartDate,
  setEndDate,
} from "../../../slices/dashboardPurchase/SupplierAgeing/reducer";
 import { clearSupplierAgeingData } from "../../../slices/dashboardPurchase/SupplierAgeing/reducer";
import usePurchaseOrders from "../../../Components/Hooks/usePurchaseOrders";
import {
  getPeriod,
} from "../../../helpers/date_helper";
const SupplierAgeing = () => {
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
  kpiOverdueAccounts = [],
loading,
  error,
  filters,
} = useSelector((state) => state.supplierAgeing);

const {
  currentReceivables,
  overdue31To60,
  overdue61To90,
  overdue91To120,
  overdue120Plus,
  overdueSupplierAccounts,
} = usePurchaseOrders(
  [], // PurchaseOrders
  [], // KPIPurchases
  [], // KPISummary
  [], // KPICategory
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

  kpiOverdueAccounts,
  filters
);

useEffect(() => {

   dispatch(
        getKPIOverdueAccounts({
          clientid: 1,
        mode: "AGING",
        accountType: "SUPPLIER",
    branchcode: filters.branch,
      dateFrom:  filters.startDate,
    dateTo:  filters.endDate,
    periodFrom: getPeriod(filters.startDate),
      periodTo: getPeriod(filters.endDate),
    includeZeroBal: false,
        }),
      );
}, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearSupplierAgeingData());
    };
  }, [dispatch]);

const handleApplyFilters = () => {
 
    dispatch(
         getKPIOverdueAccounts({
           clientid: 1,
         mode: "AGING",
         accountType: "SUPPLIER",
     branchcode: filters.branch,
       dateFrom:  filters.startDate,
     dateTo:  filters.endDate,
     periodFrom: getPeriod(filters.startDate),
       periodTo: getPeriod(filters.endDate),
     includeZeroBal: false,
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
                      <AgeingCards
                          rightClickBtn={toggleRightColumn}
                          selectedBranchName={selectedBranchName}
                        // formatAmount={formatAmount}
                        overdueSupplierAccounts={overdueSupplierAccounts}
                        currentReceivables={currentReceivables}
                        overdue31To60={overdue31To60}
                        overdue61To90={overdue61To90}
                        overdue91To120={overdue91To120}
                        overdue120Plus={overdue120Plus}
                        error={error}
                        loading={loading}
                      />
            </Col>
            </Row>
                <Row>                  
                  
                    <Col> 
                                 <SupplierAgeingTable
                               data={overdueSupplierAccounts}
                               loading={loading}
                               error={error}
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

export default SupplierAgeing;
