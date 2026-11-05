import React, { useMemo, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Badge,
  Nav,
  NavItem,
  NavLink,
  Tooltip,
  Alert,
  UncontrolledTooltip,
} from "reactstrap";
import { createColumnHelper } from "@tanstack/react-table";

import TanstackTable from "../../../Components/Common/TanstackTable";
import { exportToExcel } from "../../../helpers/export_helper";
import CardExportButtons from "../../../Components/Common/CardExportButtons";

const columnHelper = createColumnHelper();

const ReceivablesTabs = [
  {
    label: "All",
    value: "ALL",
    field: null,
    className: "bg-primary-subtle text-primary",
    activeClass: "bg-primary text-white",
    badgeClass: "bg-primary",
  },
  {
    label: "Current",
    value: "CURRENT",
    field: "current_0_30",
    className: "bg-success-subtle text-success",
    activeClass: "bg-success text-white",
    badgeClass: "bg-success",
  },
  {
    label: "31–60 Days",
    value: "31-60",
    field: "days_31_60",
    className: "bg-info-subtle text-info",
    activeClass: "bg-info text-white",
    badgeClass: "bg-info",
  },
  {
    label: "61–90 Days",
    value: "61-90",
    field: "days_61_90",
    className: "bg-warning-subtle text-warning",
    activeClass: "bg-warning text-dark",
    badgeClass: "bg-warning",
  },
  {
    label: "91–120 Days",
    value: "91-120",
    field: "days_91_120",
    className: "bg-danger-subtle text-danger",
    activeClass: "bg-danger text-white",
    badgeClass: "bg-danger",
  },
  {
    label: "120+ Days",
    value: "120+",
    field: "over_120",
    className: "bg-danger-subtle text-danger",
    activeClass: "bg-danger text-white",
    badgeClass: "bg-danger",
  },
];

  const formatAmount = (value) => Number(value ?? 0).toLocaleString("en-KE");

  const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString("en-GB") : "-";


const getCustomerRisk = (customer) => {
  if (customer.over_120 != null) {
    return {
      label: "Critical",
      className: "bg-danger-subtle text-danger",
    };
  }

  if (customer.days_91_120 != null) {
    return {
      label: "Very High",
      className: "bg-danger-subtle text-danger",
    };
  }

  if (customer.days_61_90 != null) {
    return {
      label: "High",
      className: "bg-warning-subtle text-warning",
    };
  }

  if (customer.days_31_60 != null) {
    return {
      label: "Moderate",
      className: "bg-info-subtle text-info",
    };
  }

  if (customer.current_0_30 != null) {
    return {
      label: "Low",
      className: "bg-success-subtle text-success",
    };
  }

  return {
    label: "No Exposure",
    className: "bg-secondary-subtle text-secondary",
  };
};


// Clickable Action Insight cell
const InsightCell = ({ insight, id, children }) => {
  return (
    <>
      <div
        id={id}
        style={{ minHeight: "100%", cursor: insight ? "help" : "default" }}
      >
        {children}
      </div>

      {insight && (
        <UncontrolledTooltip placement="top" target={id}>
          {insight}
        </UncontrolledTooltip>
      )}
    </>
  );
};

const ReceivablesAgeingTable = ({
  data = [],
  loading = false,
  error = null,
}) => {
  const [activeTab, setActiveTab] = useState("ALL");

  // Filter customers based on selected ageing range
const filteredData = useMemo(() => {
  if (activeTab === "ALL") return data;

  const selectedTab = ReceivablesTabs.find(
    (tab) => tab.value === activeTab
  );

  if (!selectedTab?.field) return data;

  return data.filter(
    (item) => Number(item[selectedTab.field] ?? 0) !== 0
  );
}, [data, activeTab]);

  // Customer counts for each tab
const tabCounts = useMemo(() => {
  const counts = { ALL: data.length };

  ReceivablesTabs.forEach((tab) => {
    if (tab.field) {
      counts[tab.value] = data.filter(
        (item) => Number(item[tab.field] ?? 0) !== 0
      ).length;
    }
  });

  console.table(counts);

  return counts;
}, [data]);

// const filteredData = useMemo(() => {
//   console.log("=== RECEIVABLES AGEING DEBUG ===");
//   console.log("Active Tab:", activeTab);

//   if (activeTab === "ALL") {
//     console.log("Showing ALL customers:", data.length);
//     return data;
//   }

//   const selectedTab = ReceivablesTabs.find(
//     (tab) => tab.value === activeTab
//   );

//   console.log("Selected Tab:", selectedTab);
//   console.log("Selected Ageing Field:", selectedTab?.field);

//   if (!selectedTab?.field) return data;

//   const filtered = data.filter(
//     (item) =>
//       item[selectedTab.field] !== null &&
//       item[selectedTab.field] !== undefined
//   );

//   console.log("Filtered Customers:", filtered);
//   console.log("Filtered Customer Count:", filtered.length);

//   return filtered;
// }, [data, activeTab]);

  const columns = useMemo(
    () => [
   columnHelper.accessor(
  (row) => `${row.cusname ?? ""} ${row.cuscode ?? ""}`,
  {
    id: "customer",
    header: "Customer",
    cell: ({ row }) => (
      <InsightCell
        id={`insight-customer-${row.index}`}
        insight={row.original.action_insight}
      >
        <div style={{ minWidth: "170px" }}>
          <div className="fw-semibold">
            {row.original.cusname || "-"}
          </div>
          <small className="text-muted">
            {row.original.cuscode || "-"}
          </small>
        </div>
      </InsightCell>
    ),
  }
),

      columnHelper.accessor("account_type", {
        header: "AccType",
        cell: (info) => (
          <InsightCell
            id={`insight-account-${info.row.index}`}
            insight={info.row.original.action_insight}
          >
            {info.getValue() || "-"}
          </InsightCell>
        ),
      }),

    columnHelper.accessor("total_balance", {
  header: "TotalBal(KES)",
  cell: (info) => (
    <InsightCell
      id={`insight-balance-${info.row.index}`}
      insight={info.row.original.action_insight}
    >
      <span className="fw-bold text-caramel">
        {formatAmount(info.getValue())}
      </span>
    </InsightCell>
  ),
}),

      columnHelper.accessor("last_invoice_date", {
        header: "LastInvDate",
        cell: (info) => (
          <InsightCell
            id={`insight-invoice-${info.row.index}`}
            insight={info.row.original.action_insight}
          >
            <span className="text-muted small">
              {formatDate(info.getValue())}
            </span>
          </InsightCell>
        ),
      }),

      columnHelper.accessor("last_payment_date", {
        header: "LastPaymentDate",
        cell: (info) => (
          <InsightCell
            id={`insight-payment-${info.row.index}`}
            insight={info.row.original.action_insight}
          >
            <span className="text-muted small">
              {formatDate(info.getValue())}
            </span>
          </InsightCell>
        ),
      }),

      columnHelper.accessor((row) => getCustomerRisk(row).label, {
        id: "risk",
        header: "Risk",
        cell: ({ row }) => {
          const risk = getCustomerRisk(row.original);

          return (
            <Badge className={risk.className}  pill>
              {risk.label}
            </Badge>
          );
        },
      }),
    ],
    [],
  );

const handleExportExcel = () => {
  const exportData = filteredData.map((item) => ({
    "Customer Name": item.cusname || "-",
    "Customer Code": item.cuscode || "-",
    "Account Type": item.account_type || "-",
    "Total Balance (KES)": Number(item.total_balance || 0),
    "Last Invoice Date": formatDate(item.last_invoice_date),
    "Last Payment Date": formatDate(item.last_payment_date),
    "Action Insight": item.action_insight || "-",
    Risk: getCustomerRisk(item).label,
  }));

  const today = new Date()
    .toLocaleDateString("en-GB")
    .replace(/\//g, "-");

  const selectedTab = ReceivablesTabs.find(
    (tab) => tab.value === activeTab
  );

  const safeTabName = selectedTab.label.replace(/[^a-zA-Z0-9]+/g, "_");

  exportToExcel(
    exportData,
    `Receivables_Ageing_${safeTabName}_${today}`
  );
};

  return (
    <Card id="receivables-ageing-details" className="shadow-sm">
      <CardHeader className="d-flex justify-content-between align-items-center flex-wrap border-0 pb-0 gap-2">
        <div>
          <h5 className="card-title mb-1">Receivables Ageing Details</h5>
          <p className="text-muted mb-0">
            Customer balances grouped by ageing categories
          </p>
        </div>

        <CardExportButtons
                          title="Receivables Ageing Details"
          targetId="receivables-ageing-details"
onExport={handleExportExcel}        />
      </CardHeader>

      <CardBody>
        {error && (
          <Alert color="danger" className="mb-3">
            {typeof error === "string"
              ? error
              : error.message || "Failed to load receivables ageing data."}
          </Alert>
        )}

        <TanstackTable
          columns={columns}
          data={filteredData}
          loading={loading}
          error={null}
          isGlobalFilter={true}
          isColumnFilter={false}
          customPageSize={10}
          pageSizeOptions={[5, 10, 20, 30, 50]}
          SearchPlaceholder="Search customers..."
          showPagination={true}
          showPageSize={true}
          emptyMessage="No receivables ageing records available."
          toolbarContent={
            <Nav
              pills
              className="nav-tabs-custom flex-wrap gap-1"
              role="tablist"
            >
              {ReceivablesTabs.map((tab) => {
                const isActive = activeTab === tab.value;

                return (
                  <NavItem key={tab.value}>
                    <NavLink
                      href="#"
                      active={isActive}
                      onClick={(event) => {
                        event.preventDefault();
                        setActiveTab(tab.value);
                      }}
                      className={`px-2 py-1 ${
                        isActive ? tab.activeClass : tab.className
                      }`}
                      style={{
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                        fontSize: "11px",
                        borderRadius: "6px",
                      }}
                    >
                      {tab.label}

     <Badge
className={`ms-1 ${isActive ? "bg-white text-dark" : `text-white ${tab.badgeClass}`}`}
>
  {tabCounts[tab.value]}
</Badge>
                    </NavLink>
                  </NavItem>
                );
              })}
            </Nav>
          }
          tableClass="table align-middle table-hover table-bordered table-striped"
          theadClass="table-light"
        />
      </CardBody>
    </Card>
  );
};

export default ReceivablesAgeingTable;
