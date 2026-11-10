import React, { useMemo, useState } from "react";
import {
  Nav,
  NavItem,
  NavLink,
  Card,
  CardBody,
  CardHeader,
  Badge,
} from "reactstrap";
import { createColumnHelper } from "@tanstack/react-table";

import TanstackTable from "../../Components/Common/TanstackTable";
import { exportToExcel } from "../../helpers/export_helper";
import CardExportButtons from "../../Components/Common/CardExportButtons";

const columnHelper = createColumnHelper();

const formatAmount = (value) =>
  Number(value || 0).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const tabs = [
  {
    label: "Salesperson",
    value: "salesperson",
    activeClass: "bg-primary text-white",
    inactiveClass: "bg-primary-subtle text-primary",
    badgeClass: "bg-primary",
  },
  {
    label: "Customer",
    value: "customer",
    activeClass: "bg-success text-white",
    inactiveClass: "bg-success-subtle text-success",
    badgeClass: "bg-success",
  },
];

const SalesRevenueAnalysis = ({
  salesmanData = [],
  customerData = [],
  loading = false,
  error = null,
}) => {
  const [activeTab, setActiveTab] = useState("salesperson");

  // Salesperson columns
  const salespersonColumns = useMemo(
    () => [
      columnHelper.accessor("staff_Name", {
        header: "Salesperson",
        cell: ({ row }) => (
          <span className="fw-semibold text-dark">
            {row.original.staff_Name || "Unknown Staff"}
          </span>
        ),
      }),
      columnHelper.accessor("item_Name", {
        header: "Item",
        cell: (info) => info.getValue() || "N/A",
      }),
      columnHelper.accessor("brancch_Name", {
        header: "Branch",
        cell: (info) => (
          <Badge className="bg-info-subtle text-info px-2 py-2">
            {info.getValue() || "N/A"}
          </Badge>
        ),
      }),
      columnHelper.accessor("totalSalesExcl", {
        header: "Sales Excl.",
        cell: (info) => (
          <span className="fw-semibold text-caramel">
            {formatAmount(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("quantity_Sold", {
        header: "Qty",
        cell: (info) => (
          <Badge className="bg-primary-subtle text-primary">
            {info.getValue() ?? 0}
          </Badge>
        ),
      }),
      columnHelper.accessor("gross_Profit", {
        header: "Profit",
        cell: (info) => (
          <span className="text-success fw-semibold">
            {formatAmount(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("invoice_Number", {
        header: "InvNum",
        cell: (info) => info.getValue() || "N/A",
      }),
      columnHelper.accessor("invoice_Date", {
        header: "InvDate",
        cell: (info) =>
          info.getValue()
            ? new Date(info.getValue()).toLocaleDateString("en-GB")
            : "N/A",
      }),
    ],
    [],
  );

  // Customer columns
  const customerColumns = useMemo(
    () => [
      columnHelper.accessor("client_Name", {
        header: "Customer",
        cell: ({ row }) => (
          <div>
            <div className="fw-semibold text-dark">
              {row.original.client_Name || "Unknown Customer"}
            </div>
            <small className="text-muted">
              {row.original.client_ID || "N/A"}
            </small>
          </div>
        ),
      }),
      columnHelper.accessor("item_Name", {
        header: "Item",
        cell: (info) => info.getValue() || "N/A",
      }),
      columnHelper.accessor("brancch_Name", {
        header: "Branch",
        cell: (info) => (
          <Badge className="bg-info-subtle text-info px-2 py-2">
            {info.getValue() || "N/A"}
          </Badge>
        ),
      }),
      columnHelper.accessor("totalSalesExcl", {
        header: "Sales Excl.",
        cell: (info) => (
          <span className="fw-semibold text-caramel">
            {formatAmount(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("quantity_Sold", {
        header: "Qty",
        cell: (info) => (
          <Badge className="bg-primary-subtle text-primary">
            {info.getValue() ?? 0}
          </Badge>
        ),
      }),
      columnHelper.accessor("gross_Profit", {
        header: "Profit",
        cell: (info) => (
          <span className="text-success fw-semibold">
            {formatAmount(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("invoice_Number", {
        header: "InvNum",
        cell: (info) => info.getValue() || "N/A",
      }),
      columnHelper.accessor("invoice_Date", {
        header: "InvDate",
        cell: (info) =>
          info.getValue()
            ? new Date(info.getValue()).toLocaleDateString("en-GB")
            : "N/A",
      }),
    ],
    [],
  );

  const tableConfig = {
    salesperson: {
      columns: salespersonColumns,
      data: salesmanData,
      placeholder: "Search salesperson...",
      emptyMessage: "No salesperson revenue data available.",
      exportName: "Salesperson_Revenue",
    },
    customer: {
      columns: customerColumns,
      data: customerData,
      placeholder: "Search customer...",
      emptyMessage: "No customer revenue data available.",
      exportName: "Customer_Revenue",
    },
  };

  const currentTable = tableConfig[activeTab];

  const toolbarContent = (
    <Nav pills className="nav-tabs-custom flex-wrap gap-1" role="tablist">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        const count =
          tab.value === "salesperson"
            ? salesmanData.length
            : customerData.length;

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
                isActive ? tab.activeClass : tab.inactiveClass
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
                className={`ms-1 ${
                  isActive
                    ? "bg-white text-dark"
                    : `text-white ${tab.badgeClass}`
                }`}
              >
                {count}
              </Badge>
            </NavLink>
          </NavItem>
        );
      })}
    </Nav>
  );

  const handleExportExcel = () => {
    const rows = currentTable.data.map((item) => {
      const commonFields = {
        Item: item.item_Name || "N/A",
        Branch: item.brancch_Name || "N/A",
        "Sales Excl. (KES)": Number(item.totalSalesExcl || 0),
        Qty: Number(item.quantity_Sold || 0),
        "Gross Profit (KES)": Number(item.gross_Profit || 0),
        "Invoice Number": item.invoice_Number || "N/A",
        "Invoice Date": item.invoice_Date
          ? new Date(item.invoice_Date).toLocaleDateString("en-GB")
          : "N/A",
      };

      if (activeTab === "salesperson") {
        return {
          Salesperson: item.staff_Name || "Unknown Staff",
          ...commonFields,
        };
      }

      return {
        Customer: item.client_Name || "Unknown Customer",
        "Customer ID": item.client_ID || "N/A",
        ...commonFields,
      };
    });

    const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

    exportToExcel(rows, `${currentTable.exportName}_${todayStr}`);
  };

  return (
    <Card className="card-height-100" id="sales-revenue-tabs-card">
      <CardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
     <div>
    <h4 className="card-title mb-1">Sales Revenue by Salesperson and Customer</h4>
    <p className="text-muted mb-0 fs-6">
      Invoice-level sales, quantity and gross profit by item. Switch tabs to view by salesperson or customer.
    </p>
</div>
        <CardExportButtons
          targetId="sales-revenue-tabs-card"
          title="Sales Revenue Details"
          onExport={handleExportExcel}
        />
      </CardHeader>

      <CardBody>
        <TanstackTable
          columns={currentTable.columns}
          data={currentTable.data}
          toolbarContent={toolbarContent}
          loading={loading}
          error={error}
          isGlobalFilter={true}
          isColumnFilter={false}
          searchInputWidth="450px"
          customPageSize={10}
          pageSizeOptions={[5, 10, 20, 30, 50]}
          showPagination={true}
          showPageSize={true}
          SearchPlaceholder={currentTable.placeholder}
          emptyMessage={currentTable.emptyMessage}
        />
      </CardBody>
    </Card>
  );
};

export default SalesRevenueAnalysis;
