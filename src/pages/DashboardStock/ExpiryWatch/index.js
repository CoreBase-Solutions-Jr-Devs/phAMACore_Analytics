import React, { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Card, CardHeader, CardBody } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import Section from "../Section";
import FilterActions from "../FilterActions";
import WidgetsTwo from "../WidgetsTwo";
import CustomTableOne from "../Tables/Custom/CustomTableOne";
import CardExportButtons from "../../../Components/Common/CardExportButtons";
import { exportToExcel } from "../../../helpers/export_helper";
import {
    fetchBatchExpiryNeo,
    fetchBranches,
} from "../../../slices/dashboardStock/thunk";
import { applyFilters, syncDraftFilters } from "../../../slices/dashboardStock/reducer";
import { resolveBranchName, saveActiveBranch, getActiveBranch, cleanBranchName } from "../../../helpers/branch_helper";
import { getExpiryRows } from "../../utils/StockInventoryUtils";
import { addDaysApi, parseApiDate } from "../../utils/dateHelper";

const ExpiryWatch = () => {
    document.title = "Expiry Watch | phAMACore Analytics";

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
        batchExpiryNeo = [],
        branches = [],
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
        const asOf = parseApiDate(activeFilters.endDate) || new Date();

        dispatch(fetchBatchExpiryNeo({
            clientid: 1,
            branchcode,
            startDate: addDaysApi(-365, asOf),
            endDate: addDaysApi(90, asOf),
        }));
    }, [dispatch, branchCode, activeFilters.endDate]);

    const handleExportExpiryWatch = () => {
        const rows = getExpiryRows(batchExpiryNeo, {
            branchCode,
            branches,
            asOfDate: activeFilters.endDate,
        }).map((row) => ({
            "Product": row.product,
            "Batch": row.batch || "-",
            "Branch": row.branch,
            "Expiry Date": row.expiry.toLocaleDateString("en-GB"),
            "Days Remaining": row.daysRemaining,
            "Qty Balance": row.qty.toLocaleString(),
            "Cost Value (KES)": row.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            "Action Status": row.action,
        }));
        const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
        exportToExcel(rows, `Expiry_Watch_Stock_${todayStr}`);
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
                        title="Expiry Watch"
                        pageTitle="Inventory/Stock"
                        subtitle={isBranchView ? branchDisplayName : "All Branches"}
                    />

                    <Section
                        title="EXPIRY WATCH"
                        rightClickBtn={toggleRightColumn}
                        onExportExcel={handleExportExpiryWatch}
                    />

                    <Row>
                        <Col xl={12}>
                            <Card id="expiry-watch-card">
                                <CardHeader>
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                        <h4 className="card-title mb-0">EXPIRY WATCH - EXPIRED &amp; WRITE-OFF RISK</h4>
                                        <CardExportButtons
                                            targetId="expiry-watch-card"
                                            title="Expiry Watch"
                                            onExport={handleExportExpiryWatch}
                                        />
                                    </div>
                                </CardHeader>
                                <div className="card-body p-0 border-top">
                                    <WidgetsTwo />
                                </div>
                                <CardBody className="border-top">
                                    <CustomTableOne />
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

export default ExpiryWatch;
