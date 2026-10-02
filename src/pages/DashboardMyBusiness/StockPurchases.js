import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Card, CardBody, CardHeader, Spinner } from "reactstrap";
import { StockPurchasesCharts } from "./DashboardMyBusinessCharts";
import {
  getAccountBalance,
  getKPITotalStockValueByBranch,
} from "../../helpers/fakebackend_helper";

// Format Date object to DD/MM/YYYY
const formatDMY = (date) => {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

// Safe API response list unwrapper
const parseResponseList = (response) => {
  let data = response?.data ?? response;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      data = [];
    }
  }
  if (Array.isArray(data)) return data;
  if (data?.result && Array.isArray(data.result)) return data.result;
  if (data?.result && typeof data.result === "object") return [data.result];
  if (data && typeof data === "object") return [data];
  return [];
};

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const StockPurchases = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { filters = {} } = useSelector(
    (state) => state.DashboardMyBusiness || state.MyBusiness || {}
  );
  
  const today = new Date();
  const currentMonthIdx = today.getMonth(); // 0-indexed (Jan = 0)
  const categories = monthNames.slice(0, currentMonthIdx + 1);

  const [series, setSeries] = useState([
    { name: "Stock Value", data: [] },
    { name: "Purchases", data: [] },
  ]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const currentYear = today.getFullYear();
        const dateFrom = `01/01/${currentYear}`;
        const dateTo = formatDMY(today);

        // Fetch supplier ledger transactions & current consolidated branch stock value
        const [purchasesRes, stockRes] = await Promise.all([
          getAccountBalance({
            clientid: 1,
            Mode: "DETAIL",
            AccountType: "SUPPLIER",
            DateFrom: dateFrom,
            DateTo: dateTo,
            branchcode: filters.branch ?? 0,
          }),
          getKPITotalStockValueByBranch({
            clientid: 1,
            whichcost: 1,
            branchcode: filters.branch ?? null,
          }),
        ]);

        const rawPurchases = parseResponseList(purchasesRes);
        const rawStock = parseResponseList(stockRes);

        // 1. Calculate Consolidated Total Stock Value (branch_id = 0 is All Branches)
        let totalCurrentStock = 0;
        const allBranchStock = rawStock.find(
          (b) => Number(b.branch_id ?? b.branchCode ?? b.bcode) === 0
        );
        if (allBranchStock) {
          totalCurrentStock = Number(
            allBranchStock.total_stock_value ?? allBranchStock.stock_value ?? 0
          );
        } else {
          rawStock.forEach((b) => {
            totalCurrentStock += Number(
              b.total_stock_value ?? b.stock_value ?? 0
            );
          });
        }

        // 2. Aggregate Purchases for each month (Jan .. current month)
        const monthlyPurchases = new Array(currentMonthIdx + 1).fill(0);

        rawPurchases.forEach((row) => {
          // Identify transaction date/period
          let monthIndex = -1;

          if (row.period && String(row.period).length === 6) {
            const pMonth = parseInt(String(row.period).substring(4, 6), 10) - 1;
            const pYear = parseInt(String(row.period).substring(0, 4), 10);
            if (pYear === currentYear && pMonth >= 0 && pMonth <= currentMonthIdx) {
              monthIndex = pMonth;
            }
          }

          if (monthIndex === -1 && (row.trans_date || row.DOCDATE || row.date)) {
            const rawD = row.trans_date || row.DOCDATE || row.date;
            // Handle DD/MM/YYYY or ISO
            let dObj = null;
            if (typeof rawD === "string" && rawD.includes("/")) {
              const [d, m, y] = rawD.split("/");
              dObj = new Date(`${y}-${m}-${d}`);
            } else {
              dObj = new Date(rawD);
            }
            if (!isNaN(dObj.getTime()) && dObj.getFullYear() === currentYear) {
              monthIndex = dObj.getMonth();
            }
          }

          if (monthIndex >= 0 && monthIndex <= currentMonthIdx) {
            const isInvoice =
              Number(row.MODULECODE) === 12 ||
              String(row.trans_type || "").toUpperCase().includes("SUPPLIERINVOICE") ||
              String(row.account_type || "").toUpperCase() === "SUPPLIER";

            const isReturn =
              Number(row.MODULECODE) === 14 ||
              String(row.trans_type || "").toUpperCase().includes("GOODSRETURNED");

            const amount = Number(row.debit ?? row.ITMTOTALINC ?? row.total_invoiced ?? row.amount ?? 0);

            if (isReturn) {
              monthlyPurchases[monthIndex] -= amount;
            } else {
              monthlyPurchases[monthIndex] += amount;
            }
          }
        });

        // 3. Stock Value per month:
        // Maintains current valuation level across the active months
        const monthlyStock = new Array(currentMonthIdx + 1).fill(
          Math.round(totalCurrentStock)
        );

        const cleanPurchases = monthlyPurchases.map((val) =>
          Math.max(0, Math.round(val))
        );

        if (isMounted) {
          setSeries([
            { name: "Stock Value", data: monthlyStock },
            { name: "Purchases", data: cleanPurchases },
          ]);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load stock vs purchases trend"
          );
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [currentMonthIdx, filters.branch]);

  return (
    <Card className="card-height-100">
      <CardHeader className="border-0 align-items-center d-flex">
        <h4 className="card-title mb-0 flex-grow-1">
          Stock vs Purchases Monthly Trend
        </h4>
        <span className="badge bg-light text-muted">
          Jan - {monthNames[currentMonthIdx]} YTD
        </span>
      </CardHeader>
      <CardBody className="p-0 pb-2">
        <div className="w-100">
          <div dir="ltr">
            {loading ? (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "370px" }}
              >
                <Spinner size="sm" color="primary" className="me-2" />
                <span className="text-muted">Loading trend data...</span>
              </div>
            ) : error ? (
              <div
                className="d-flex justify-content-center align-items-center text-danger"
                style={{ minHeight: "370px" }}
              >
                {error}
              </div>
            ) : (
              <StockPurchasesCharts
                categories={categories}
                series={series}
                dataColors='["--vz-primary", "--vz-success"]'
              />
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default StockPurchases;