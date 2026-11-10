import React, { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Card, CardHeader, CardBody } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import Section from "../Section";
import FilterActions from "../FilterActions";
import CriticalStockChart, { suggestedOrderQty } from "../components/CriticalStockChart";
import CardExportButtons from "../../../Components/Common/CardExportButtons";
import { exportToExcel } from "../../../helpers/export_helper";
import {
    fetchBranches,
    fetchKPICriticalStockouts,
    fetchKPIStockHealth,
} from "../../../slices/dashboardStock/thunk";
import { applyFilters, syncDraftFilters } from "../../../slices/dashboardStock/reducer";
import { resolveBranchName, saveActiveBranch, getActiveBranch, cleanBranchName } from "../../../helpers/branch_helper";
import { CRITICAL_TOP_N, getLookbackDays } from "../../utils/StockInventoryUtils";

const CriticalStockLevels = () => {
    document.title = "Critical Stock Levels | phAMACore Analytics";

    const dispatch = useDispatch();
    const { branchId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const queryBranchParam = searchParams.get("branch");
    const urlBranchCode = useMemo(() => {
        const raw = branchId ?? queryBranchParam;
        if (raw === null || raw === undefined || raw === "") return null;
        const parsed = Number(raw);
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
    }, [branchId, queryBranchParam]);

    const {
        branches = [],
        criticalStockouts = [],
        filters = {},
        appliedFilters,
    } = useSelector((state) => state.StockInventory ?? {});

    const activeFilters = appliedFilters || filters;
    const branchCode = activeFilters.branch && Number(activeFilters.branch) > 0 ? Number(activeFilters.branch) : 0;
    const isBranchView = branchCode > 0;

    const branchDisplayName = isBranchView
        ? cleanBranchName(resolveBranchName(branchCode, branches))
        : "";

    const lookbackDays = getLookbackDays(activeFilters.startDate, activeFilters.endDate);

    const [rightColumn, setRightColumn] = useState(false);

    const toggleRightColumn = () => {
        setRightColumn((prev) => {
            if (prev) {
                dispatch(syncDraftFilters());
            }
            return !prev;
        });
    };

    useEffect(() => {
        if (urlBranchCode !== null) {
            saveActiveBranch("stock", urlBranchCode);
            dispatch(applyFilters({ branch: urlBranchCode }));
            return;
        }

        const persistedBranch = getActiveBranch("stock") ?? 0;
        dispatch(applyFilters({ branch: persistedBranch }));
        setSearchParams({ branch: String(persistedBranch) }, { replace: true });
    }, [dispatch, urlBranchCode, setSearchParams]);

    useEffect(() => {
        dispatch(fetchBranches({ clientid: 1 }));
    }, [dispatch]);

    useEffect(() => {
        const branchcode = branchCode || 0;
        const health = {
            clientid: 1,
            branchcode,
            LookbackDays: lookbackDays,
            AsOfDate: activeFilters.endDate,
        };

        dispatch(fetchKPIStockHealth(health));
        dispatch(fetchKPICriticalStockouts({ ...health, GroupBy: "CRITICAL_STOCKOUTS", TopN: CRITICAL_TOP_N }));
    }, [dispatch, branchCode, activeFilters.endDate, lookbackDays]);

    const handleExportCriticalStock = () => {
        const rows = (criticalStockouts || []).map((item) => ({
            "Item Name": item.item_name || "Unknown",
            "Item Code": item.item_code || "",
            "Category / Group": item.item_group || "-",
            "Branch": cleanBranchName(item.branch_name || item.branchName || ""),
            "Current Stock": Number(item.current_stock_qty ?? 0).toLocaleString(),
            "Min Reorder Qty": Number(item.effective_min_qty ?? item.branch_min_qty ?? 0).toLocaleString(),
            "ABC Class": item.abc_class || "-",
            "Monthly Demand": Number(item.monthly_demand ?? 0).toLocaleString(),
            "Days of Inventory": item.days_of_inventory !== undefined ? Number(item.days_of_inventory) : "-",
            "Suggested Order Qty (estimate)": suggestedOrderQty(item).toLocaleString(),
            "Risk Status": item.stockout_risk_status || (Number(item.days_of_inventory ?? 0) <= 6 ? "CRITICAL" : "REORDER"),
            "Action Insight": item.action_insight || "-",
        }));
        const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
        exportToExcel(rows, `Critical_Stock_Levels_${todayStr}`);
    };

    const handleApplyFilters = () => {
        const nextBranch = filters.branch && Number(filters.branch) > 0 ? Number(filters.branch) : 0;
        saveActiveBranch("stock", nextBranch);
        dispatch(applyFilters({ branch: nextBranch }));
        setRightColumn(false);
        setSearchParams({ branch: String(nextBranch) }, { replace: true });
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        title="Critical Stock Levels"
                        pageTitle="Inventory/Stock"
                        subtitle={isBranchView ? branchDisplayName : "All Branches"}
                    />

                    <Section
                        title="CRITICAL STOCK LEVELS"
                        rightClickBtn={toggleRightColumn}
                        onExportExcel={handleExportCriticalStock}
                    />

                    <Row>
                        <Col xl={12}>
                            <Card id="critical-stock-card" className="mb-2">
                                <CardHeader>
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                        <div>
                                            <h4 className="card-title mb-1">
                                                Critical Stock Levels - MUST-NOT STOCKOUT items
                                            </h4>
                                            <p className="text-muted mb-0 small">
                                                Pareto Class ABC items (top revenue sellers) at risk
                                                {criticalStockouts.length > 0 && ` · ${criticalStockouts.length.toLocaleString()} items`}
                                            </p>
                                        </div>
                                        <CardExportButtons
                                            targetId="critical-stock-card"
                                            title="Critical Stock Levels"
                                            onExport={handleExportCriticalStock}
                                        />
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    <CriticalStockChart />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
                <FilterActions
                    onApply={handleApplyFilters}
                    rightColumn={rightColumn}
                    hideRightColumn={toggleRightColumn}
                />
            </div>
        </React.Fragment>
    );
};

export default CriticalStockLevels;
