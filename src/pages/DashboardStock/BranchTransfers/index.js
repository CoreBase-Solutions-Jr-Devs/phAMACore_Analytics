import React, { useEffect, useMemo, useState } from "react";
import { Container } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import Section from "../Section";
import FilterActions from "../FilterActions";
import BranchTransfersSection, {
    normalizeDestStockAging,
    normalizeDrilldownRows,
} from "../components/BranchTransfersSection";
import { exportToExcel } from "../../../helpers/export_helper";
import {
    fetchBranches,
    fetchKPIBranchTransfers,
} from "../../../slices/dashboardStock/thunk";
import { applyFilters, syncDraftFilters } from "../../../slices/dashboardStock/reducer";
import { resolveBranchName, saveActiveBranch, getActiveBranch, cleanBranchName } from "../../../helpers/branch_helper";

const BranchTransfers = () => {
    document.title = "Branch Transfers | phAMACore Analytics";

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
        branchTransfersDrilldown = [],
        branchTransfersDestStockAging = [],
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

        dispatch(fetchKPIBranchTransfers({ ...periodParams, GroupBy: "SUMMARY" }));
        dispatch(fetchKPIBranchTransfers({ ...periodParams, GroupBy: "BRANCH_BALANCE" }));
        dispatch(fetchKPIBranchTransfers({ ...periodParams, GroupBy: "IN_TRANSIT" }));
        dispatch(fetchKPIBranchTransfers({ ...periodParams, GroupBy: "TOP_SKUS" }));
        dispatch(fetchKPIBranchTransfers({ ...periodParams, GroupBy: "DRILLDOWN" }));
        dispatch(fetchKPIBranchTransfers({ ...periodParams, GroupBy: "DEST_STOCK_AGING" }));
    }, [dispatch, branchCode, activeFilters.startDate, activeFilters.endDate]);

    const handleExportBranchTransfers = () => {
        const allAgingRows = normalizeDestStockAging(branchTransfersDestStockAging);
        const allDrilldownRows = normalizeDrilldownRows(branchTransfersDrilldown);
        const docToSource = new Map();
        allDrilldownRows.forEach((d) => {
            if (d.transferDoc && d.transferDoc !== "-") {
                docToSource.set(d.transferDoc, {
                    sourceBranchCode: d.sourceBranchCode,
                    sourceBranchName: d.sourceBranchName,
                });
            }
        });
        const enrichedAgingRows = allAgingRows.map((r) => {
            const match = docToSource.get(r.transferDoc);
            return match
                ? {
                      ...r,
                      sourceBranchCode: r.sourceBranchCode || match.sourceBranchCode,
                      sourceBranchName: r.sourceBranchName || match.sourceBranchName,
                  }
                : r;
        });

        const rows = enrichedAgingRows.map((r) => ({
            "Product": r.itemName,
            "Item Code": r.itemCode,
            "Batch": r.batchNo,
            "Source Branch": r.sourceBranchName || "-",
            "Destination Branch": r.destBranchName,
            "Transfer Voucher": r.transferDoc,
            "Transfer Date": r.transferDate,
            "Receipt Voucher": r.receiptDoc,
            "Receipt Date": r.receiptDate,
            "Transferred Units (Packs)": r.transferredUnits,
            "Transfer Value (KES)": r.transferredCost,
            "Sold Since Receipt": r.unitsSoldSinceReceipt,
            "Current Branch Stock": r.currentBranchStock,
            "Days in Stock": r.daysInStock,
            "Aging Bucket": r.agingBucket,
        }));
        const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
        exportToExcel(rows, `Branch_Transfers_${todayStr}`);
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
                        title="Branch Transfers"
                        pageTitle="Inventory/Stock"
                        subtitle={isBranchView ? branchDisplayName : "All Branches"}
                    />

                    <Section
                        title="BRANCH TRANSFERS & SYOKIMAU PULL"
                        rightClickBtn={toggleRightColumn}
                        onExportExcel={handleExportBranchTransfers}
                    />

                    <BranchTransfersSection />
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

export default BranchTransfers;
