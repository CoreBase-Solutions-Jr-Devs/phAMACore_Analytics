import React, { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Card, CardHeader, CardBody } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import Section from "../Section";
import FilterActions from "../FilterActions";
import ImbalanceAlerts from "../components/ImbalanceAlerts";
import CardExportButtons from "../../../Components/Common/CardExportButtons";
import { exportToExcel } from "../../../helpers/export_helper";
import {
    fetchBranches,
    fetchKPIImbalances,
} from "../../../slices/dashboardStock/thunk";
import { applyFilters, syncDraftFilters } from "../../../slices/dashboardStock/reducer";
import { resolveBranchName, saveActiveBranch, getActiveBranch, cleanBranchName } from "../../../helpers/branch_helper";
import {
    buildTransferSuggestions,
    filterTransferSuggestions,
    getImbalanceBranches,
    IMBALANCE_STATUS_FILTERS,
    getLookbackDays,
    IMBALANCE_TOP_N,
} from "../../utils/StockInventoryUtils";

const InterBranchImbalances = () => {
    document.title = "Inter-Branch Imbalances | phAMACore Analytics";

    const [imbalanceSearchTerm, setImbalanceSearchTerm] = useState("");
    const [imbalanceStatusFilter, setImbalanceStatusFilter] = useState("ALL");
    const [imbalanceBranchFilter, setImbalanceBranchFilter] = useState("");

    const getImbalanceTabBtnClass = (key) => {
        const isActive = imbalanceStatusFilter === key;
        if (key === "DEFICIT") return isActive ? "btn-danger" : "btn-outline-danger";
        if (key === "SURPLUS") return isActive ? "btn-success" : "btn-outline-success";
        return isActive ? "btn-caramel" : "btn-outline-caramel";
    };

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
        imbalances = [],
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

        dispatch(fetchKPIImbalances({ ...health, TopN: IMBALANCE_TOP_N }));
    }, [dispatch, branchCode, activeFilters.endDate, lookbackDays]);

    const imbalanceBranches = useMemo(
        () => getImbalanceBranches(imbalances),
        [imbalances]
    );

    useEffect(() => {
        if (imbalanceBranchFilter && !imbalanceBranches.includes(imbalanceBranchFilter)) {
            setImbalanceBranchFilter("");
        }
    }, [imbalanceBranches, imbalanceBranchFilter]);

    const imbalanceCounts = useMemo(() => {
        const list = buildTransferSuggestions(imbalances, lookbackDays).filter(
            (item) => !imbalanceBranchFilter || item.branch === imbalanceBranchFilter
        );
        const deficit = list.filter((item) => item.deficit).length;
        return { deficit, surplus: list.length - deficit };
    }, [imbalances, lookbackDays, imbalanceBranchFilter]);

    const handleExportImbalanceAlerts = () => {
        const suggestions = filterTransferSuggestions(
            buildTransferSuggestions(imbalances, lookbackDays),
            imbalanceStatusFilter,
            imbalanceBranchFilter
        );
        const rows = suggestions.map((a) => ({
            "Product": a.product,
            "Item Code": a.itemCode,
            "Category": a.group,
            "Branch": a.branch,
            "Status": a.deficit ? "Deficit" : "Surplus",
            "Imbalance Gap %": Number(a.gap.toFixed(1)),
            "Branch Stock": a.stock.toLocaleString(),
            "Company Stock": a.companyStock.toLocaleString(),
            "Stock Share %": Number(a.stockShare.toFixed(1)),
            "Branch Sales": a.sales.toLocaleString(),
            "Company Sales": a.companySales.toLocaleString(),
            "Sales Share %": Number(a.salesShare.toFixed(1)),
            "Required Transfer Units": a.qty.toLocaleString(),
            "Network Counterpart": a.networkContext,
            "Action": a.actionInsight,
        }));
        const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
        exportToExcel(rows, `InterBranch_Transfer_Suggestions_${todayStr}`);
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
                        title="Inter-Branch Imbalances"
                        pageTitle="Inventory/Stock"
                        subtitle={isBranchView ? branchDisplayName : "All Branches"}
                    />

                    <Section
                        title="INTER-BRANCH TRANSFER SUGGESTIONS"
                        rightClickBtn={toggleRightColumn}
                        onExportExcel={handleExportImbalanceAlerts}
                    />

                    <Row>
                        <Col xl={12}>
                            <Card id="imbalance-alerts-card">
                                <CardHeader>
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                        <h4 className="card-title mb-0">INTER-BRANCH TRANSFER SUGGESTIONS</h4>
                                        <CardExportButtons
                                            targetId="imbalance-alerts-card"
                                            title="Inter-Branch Imbalance Alerts"
                                            onExport={handleExportImbalanceAlerts}
                                        />
                                    </div>
                                </CardHeader>

                                <CardBody>
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                                        <p className="text-muted mb-0 small">
                                            Branches with a difference 20% of an item's stock against its sales. These are suggestions only; no transfer has been raised.
                                        </p>

                                        <div className="d-flex align-items-center gap-2 ms-auto">
                                            <label
                                                htmlFor="imbalance-branch-filter"
                                                className="text-muted small mb-0 text-nowrap fw-medium"
                                            >
                                                <i className="ri-filter-3-line me-1 align-middle"></i>
                                                Branch:
                                            </label>
                                            <select
                                                id="imbalance-branch-filter"
                                                className="form-select form-select-sm"
                                                style={{ minWidth: "180px", width: "auto" }}
                                                value={imbalanceBranchFilter}
                                                onChange={(e) => setImbalanceBranchFilter(e.target.value)}
                                                aria-label="Filter imbalances by branch"
                                            >
                                                <option value="">All Branches</option>
                                                {imbalanceBranches.map((branchName) => (
                                                    <option key={branchName} value={branchName}>
                                                        {branchName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <Row className="mb-3 align-items-center g-2">
                                        <Col>
                                            <input
                                                className="form-control"
                                                placeholder="Search by product, branch, category, or code..."
                                                value={imbalanceSearchTerm}
                                                onChange={(e) => setImbalanceSearchTerm(e.target.value)}
                                            />
                                        </Col>

                                        <Col xs="auto">
                                            <div className="btn-group" role="group" aria-label="Filter by imbalance status">
                                                {IMBALANCE_STATUS_FILTERS.map((tab) => (
                                                    <button
                                                        key={tab.key}
                                                        type="button"
                                                        className={`btn ${getImbalanceTabBtnClass(tab.key)}`}
                                                        onClick={() => setImbalanceStatusFilter(tab.key)}
                                                    >
                                                        {tab.label}
                                                        {tab.key !== "ALL" && (
                                                            <span className="badge bg-light text-body ms-1">
                                                                {tab.key === "DEFICIT" ? imbalanceCounts.deficit : imbalanceCounts.surplus}
                                                            </span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </Col>
                                    </Row>
                                    <ImbalanceAlerts
                                        searchTerm={imbalanceSearchTerm}
                                        statusFilter={imbalanceStatusFilter}
                                        branchFilter={imbalanceBranchFilter}
                                    />
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

export default InterBranchImbalances;
