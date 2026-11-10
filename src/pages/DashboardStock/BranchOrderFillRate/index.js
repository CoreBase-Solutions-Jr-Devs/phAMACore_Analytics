import React, { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Card, CardHeader, CardBody } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import Section from "../Section";
import FilterActions from "../FilterActions";
import BranchOfrSection, { OFR_TABS } from "../components/BranchOfrSection";
import CardExportButtons from "../../../Components/Common/CardExportButtons";
import { exportToExcel } from "../../../helpers/export_helper";
import {
    fetchBranches,
    fetchKPIBranchOrderFillRate,
} from "../../../slices/dashboardStock/thunk";
import { applyFilters, syncDraftFilters } from "../../../slices/dashboardStock/reducer";
import { resolveBranchName, saveActiveBranch, getActiveBranch, cleanBranchName } from "../../../helpers/branch_helper";

const BranchOrderFillRate = () => {
    document.title = "Branch Order Fill Rate | phAMACore Analytics";

    const [ofrActiveTab, setOfrActiveTab] = useState("BRANCH_OFR");
    const [ofrSearchTerm, setOfrSearchTerm] = useState("");

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
        branchOrderFillRateByBranch = [],
        branchOrderFillRateDrilldown = [],
        branchOrderFillRateTopShortages = [],
        filters = {},
        appliedFilters,
    } = useSelector((state) => state.StockInventory ?? {});

    const activeFilters = appliedFilters || filters;
    const branchCode = activeFilters.branch && Number(activeFilters.branch) > 0 ? Number(activeFilters.branch) : 0;
    const isBranchView = branchCode > 0;

    const branchDisplayName = isBranchView
        ? cleanBranchName(resolveBranchName(branchCode, branches))
        : "";

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
        const periodParams = {
            clientid: 1,
            startDate: activeFilters.startDate,
            endDate: activeFilters.endDate,
            branchcode,
            TopN: 500,
        };

        dispatch(fetchKPIBranchOrderFillRate({ ...periodParams, GroupBy: "SUMMARY" }));
        dispatch(fetchKPIBranchOrderFillRate({ ...periodParams, GroupBy: "BRANCH_OFR" }));
        dispatch(fetchKPIBranchOrderFillRate({ ...periodParams, GroupBy: "TOP_SHORTAGES" }));
    }, [dispatch, branchCode, activeFilters.startDate, activeFilters.endDate]);

    const handleExportBranchOfr = () => {
        let source = branchOrderFillRateByBranch;
        if (ofrActiveTab === "ORDER_DRILLDOWN") source = branchOrderFillRateDrilldown;
        else if (ofrActiveTab === "TOP_SHORTAGES") source = branchOrderFillRateTopShortages;
        const rows = (Array.isArray(source) ? source : []).map((r) => ({ ...r }));
        const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
        exportToExcel(rows, `Branch_Order_Fill_Rate_${ofrActiveTab}_${todayStr}`);
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
                        title="Branch Order Fill Rate"
                        pageTitle="Inventory/Stock"
                        subtitle={isBranchView ? branchDisplayName : "All Branches"}
                    />

                    <Section
                        title="BRANCH ORDER FILL RATE (OFR)"
                        rightClickBtn={toggleRightColumn}
                        onExportExcel={handleExportBranchOfr}
                    />

                    <Row>
                        <Col xl={12}>
                            <Card id="branch-ofr-card" className="mb-2">
                                <CardHeader>
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                        <div>
                                            <h4 className="card-title mb-1">
                                                BRANCH ORDER FILL RATE (OFR) — LPOS TO SYOKIMAU CENTRAL HUB
                                            </h4>
                                            <p className="text-muted mb-0 small">
                                                Fulfillment fidelity for internal branch LPOs raised to Syokimau (Orders vs Dispatches vs Branch Receipts)
                                            </p>
                                        </div>
                                        <CardExportButtons
                                            targetId="branch-ofr-card"
                                            title="Branch Order Fill Rate"
                                            onExport={handleExportBranchOfr}
                                        />
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    <Row className="mb-3 align-items-center g-2">
                                        <Col md={5}>
                                            <input
                                                className="form-control form-control-sm"
                                                placeholder="Search branch, LPO voucher, or shortage SKU..."
                                                value={ofrSearchTerm}
                                                onChange={(e) => setOfrSearchTerm(e.target.value)}
                                            />
                                        </Col>
                                        <Col md="auto" className="ms-md-auto">
                                            <div className="btn-group btn-group-sm" role="group" aria-label="OFR view tabs">
                                                {OFR_TABS.map((t) => (
                                                    <button
                                                        key={t.key}
                                                        type="button"
                                                        className={`btn ${
                                                            ofrActiveTab === t.key
                                                                ? "btn-caramel"
                                                                : "btn-outline-caramel"
                                                        }`}
                                                        onClick={() => setOfrActiveTab(t.key)}
                                                    >
                                                        {t.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </Col>
                                    </Row>
                                    <BranchOfrSection
                                        activeTab={ofrActiveTab}
                                        searchTerm={ofrSearchTerm}
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

export default BranchOrderFillRate;
