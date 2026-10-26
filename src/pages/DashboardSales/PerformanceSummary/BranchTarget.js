
import React, { useMemo, useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Row,
  Col,
  Table,
  Badge,
  Button,
} from "reactstrap";
import { exportToExcel } from "../../../helpers/export_helper";
import CardExportButtons from "../../../Components/Common/CardExportButtons";
const MONTHS = [
  { key: "jan", label: "Jan", monthNo: 1 },
  { key: "feb", label: "Feb", monthNo: 2 },
  { key: "mar", label: "Mar", monthNo: 3 },
  { key: "apr", label: "Apr", monthNo: 4 },
  { key: "may", label: "May", monthNo: 5 },
  { key: "jun", label: "Jun", monthNo: 6 },
  { key: "jul", label: "Jul", monthNo: 7 },
  { key: "aug", label: "Aug", monthNo: 8 },
  { key: "sep", label: "Sep", monthNo: 9 },
  { key: "oct", label: "Oct", monthNo: 10 },
  { key: "nov", label: "Nov", monthNo: 11 },
  { key: "dec", label: "Dec", monthNo: 12 },
];

const BRANCHES = [
  { branchID: 1, branchName: "Syokimau" },
  { branchID: 2, branchName: "Tassia" },
  { branchID: 3, branchName: "Machakos" },
  { branchID: 4, branchName: "Mtwapa" },
  { branchID: 5, branchName: "Kasarani" },
  { branchID: 6, branchName: "Eldoret" },
  { branchID: 7, branchName: "Busia" },
  { branchID: 8, branchName: "Msa GPO" },
  { branchID: 9, branchName: "Kitale" },
  { branchID: 10, branchName: "Kisii" },
];

const formatAmount = (value) =>
  Number(value ?? 0).toLocaleString("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

const getVariancePct = (actual, target) => {
  const sales = Number(actual ?? 0);
  const targetAmount = Number(target ?? 0);

  if (targetAmount === 0) return null;

  return ((sales - targetAmount) / targetAmount) * 100;
};

const getBadgeColor = (percentage) => {
  if (percentage == null || percentage < 0) {
    return "bg-danger-subtle text-danger";
  }

  if (percentage < 10) {
    return "bg-warning-subtle text-warning-emphasis";
  }

  if (percentage < 50) {
    return "bg-info-subtle text-info";
  }

  if (percentage < 100) {
    return "bg-primary-subtle text-primary";
  }

  return "bg-success-subtle text-success";
};

const getBranchName = (apiName, fallbackName) => {
  if (!apiName) return fallbackName;

  return apiName
    .replace(/^AXCESS PHARMACY\s*-\s*/i, "")
    .trim();
};

const BranchTarget = ({
  data,
  loading = false,
  error = null,
}) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // The API returns one record per branch per month.
  const sourceData = Array.isArray(data) ? data : [];

  // Transform the monthly API records into one row per branch.
  const branchData = useMemo(() => {
    return BRANCHES.map((branch) => {
      const branchRecords = sourceData.filter(
        (item) => Number(item.branchID) === branch.branchID
      );

      const row = {
        ...branch,
      };

      // Initialise all 12 months.
      MONTHS.forEach(({ key }) => {
        row[`${key}Sales`] = 0;
        row[`${key}Target`] = 0;
      });

      // Populate the monthly Sales and Target values.
      branchRecords.forEach((item) => {
        const month = MONTHS.find(
          (itemMonth) =>
            itemMonth.monthNo === Number(item.monthNo)
        );

        if (!month) return;

        row.branchName = getBranchName(
          item.branchName,
          branch.branchName
        );

        row[`${month.key}Sales`] = Number(
          item.actualSalesExcl ?? 0
        );

        row[`${month.key}Target`] = Number(
          item.targetSales ?? 0
        );
      });

      return row;
    });
  }, [sourceData]);

  // Search by branch name.
  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();

    return branchData.filter((branch) =>
      branch.branchName.toLowerCase().includes(query)
    );
  }, [branchData, search]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const currentPage = Math.min(
    page,
    Math.max(totalPages - 1, 0)
  );

  // Reset pagination if the API data changes.
  useEffect(() => {
    setPage(0);
  }, [data]);

  const paginatedData = filteredData.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const startResult =
    filteredData.length === 0
      ? 0
      : currentPage * pageSize + 1;

  const endResult = Math.min(
    (currentPage + 1) * pageSize,
    filteredData.length
  );

  const changeSearch = (value) => {
    setSearch(value);
    setPage(0);
  };

  const changePageSize = (event) => {
    setPageSize(Number(event.target.value));
    setPage(0);
  };

  const handleExportExcel = () => {
    const rows = filteredData.map((branch) => {
      const row = {
        Branch: branch.branchName,
      };

      MONTHS.forEach((month) => {
        const sales = branch[`${month.key}Sales`];
        const target = branch[`${month.key}Target`];
        const variance = getVariancePct(sales, target);

        row[`${month.label} Sales (KES)`] = Number(sales ?? 0);
        row[`${month.label} Target (KES)`] = Number(target ?? 0);
        row[`${month.label} Var (%)`] =
          variance == null ? "" : Number(variance.toFixed(1));
      });

      return row;
    });

    const todayStr = new Date()
      .toLocaleDateString("en-GB")
      .replace(/\//g, "-");

    exportToExcel(
      rows,
      `Branch_Sales_Target_Performance_${todayStr}`,
    );
  };

  return (
    <Card className="card-height-100">
      <CardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2 pb-2">
        <div>
          <h4 className="card-title mb-1">
            Branch Sales &amp; Target Performance
          </h4>

          <p className="text-muted mb-0">
            Monthly sales, targets, and percentage variance
            across branches
          </p>
        </div>
          <CardExportButtons
          targetId="branch-target-performance-card"
          title="Branch Sales and Target Performance"
          onExport={handleExportExcel}
        />
      </CardHeader>

      <CardBody className="pt-2">
        {loading ? (
          <div className="text-center py-5">
            <div
              className="spinner-border text-primary"
              role="status"
            />

            <p className="text-muted mt-2 mb-0">
              Loading branch performance...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-5 text-danger">
            {typeof error === "string"
              ? error
              : error.message ||
                "Failed to load branch performance."}
          </div>
        ) : (
          <>
            <Row className="align-items-center g-3 mb-3">
              <Col sm={6} md={5}>
                <Input
                  type="search"
                  value={search}
                  placeholder="Search branches and months"
                  onChange={(event) =>
                    changeSearch(event.target.value)
                  }
                  aria-label="Search branches"
                />
              </Col>

          
            </Row>

            <div
              className="table-responsive"
              style={{
                overflowX: "auto",
                position: "relative",
              }}
            >
              <Table
                hover
                responsive={false}
                className="table-nowrap align-middle mb-0"
              >
                <thead>
                  <tr>
                    <th
                      rowSpan={2}
                      className="table-light align-middle"
                      style={{
                        position: "sticky",
                        left: 0,
                        zIndex: 3,
                        minWidth: "160px",
                        backgroundColor: "#f3f6f9",
                        borderLeft: "1px solid #cbd5e1",
                      }}
                    >
                      Branch
                    </th>

                    {MONTHS.map((month) => (
                      <th
                        key={month.key}
                        colSpan={3}
                        className="table-light text-center"
                        style={{
                          backgroundColor: "#f3f6f9",
                          borderRight: "1px solid #cbd5e1",
                        }}
                      >
                        {month.label}
                      </th>
                    ))}
                  </tr>

                  <tr>
                    {MONTHS.map((month) => (
                      <React.Fragment key={month.key}>
                        <th
                          className="table-light text-end fw-normal"
                          style={{
                            borderLeft: "1px solid #cbd5e1",
                          }}
                        >
                          Sales
                        </th>

                        <th className="table-light text-end fw-normal">
                          Target
                        </th>

                        <th
                          className="table-light text-end fw-normal"
                          style={{
                            borderRight: "1px solid #cbd5e1",
                          }}
                        >
                          Var %
                        </th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((branch) => (
                      <tr key={branch.branchID}>
                        <td
                          className="fw-semibold"
                          style={{
                            position: "sticky",
                            left: 0,
                            zIndex: 2,
                            minWidth: "160px",
                            backgroundColor: "#fff",
                          }}
                        >
                          {branch.branchName}
                        </td>

                        {MONTHS.map((month) => {
                          const sales =
                            branch[`${month.key}Sales`];

                          const target =
                            branch[`${month.key}Target`];

                          const percentage = getVariancePct(
                            sales,
                            target
                          );

                          return (
                            <React.Fragment key={month.key}>
                              <td
                                className="text-end"
                                style={{
                                  borderLeft:
                                    "1px solid #cbd5e1",
                                }}
                              >
                                {formatAmount(sales)}
                              </td>

                              <td className="text-end">
                                {formatAmount(target)}
                              </td>

                              <td
                                className="text-end"
                                style={{
                                  borderRight:
                                    "1px solid #cbd5e1",
                                }}
                              >
                                <Badge
                                  className={getBadgeColor(
                                    percentage
                                  )}
                                >
                                  {percentage == null
                                    ? "0"
                                    : `${percentage.toFixed(1)}%`}
                                </Badge>
                              </td>
                            </React.Fragment>
                          );
                        })}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={1 + MONTHS.length * 3}
                        className="text-center py-4 text-muted"
                      >
                        {sourceData.length === 0
                          ? "No monthly performance data available."
                          : "No branches found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>

          <Row className="align-items-center mt-3 g-2">
  <Col sm={12} md={5}>
    <div className="text-muted small">
      Showing <strong>{startResult}</strong> to{" "}
      <strong>{endResult}</strong> of{" "}
      <strong>{filteredData.length}</strong> branches
      {/* <span className="ms-2">
        (Total branches: <strong>{branchData.length}</strong>)
      </span> */}
    </div>
  </Col>

  <Col sm={12} md={7}>
    <div className="d-flex flex-wrap justify-content-md-end justify-content-start align-items-center gap-2">
   {/* Rows per page */}
<div className="d-flex align-items-center gap-2">
  <span className="text-muted small text-nowrap">
    Rows per page
  </span>

  <Input
    type="select"
    bsSize="sm"
    value={pageSize}
    onChange={changePageSize}
    aria-label="Rows per page"
    className="py-1 px-2"
    style={{ width: "75px" }}
  >
    <option value={5}>5</option>
    <option value={10}>10</option>
    <option value={20}>20</option>
    <option value={30}>30</option>
  </Input>
</div>

      <Button
        color="light"
        outline
        size="sm"
        disabled={currentPage === 0}
        onClick={() => setPage(currentPage - 1)}
        className="text-caramel"
      >
        Previous
      </Button>

      {Array.from({ length: totalPages }, (_, index) => (
        <Button
          key={index}
          size="sm"
          onClick={() => setPage(index)}
          className={
            currentPage === index
              ? "border border-caramel bg-caramel text-white"
              : "border text-caramel bg-white"
          }
        >
          {index + 1}
        </Button>
      ))}

      <Button
        color="light"
        outline
        size="sm"
        disabled={
          totalPages === 0 || currentPage >= totalPages - 1
        }
        onClick={() => setPage(currentPage + 1)}
        className="text-caramel"
      >
        Next
      </Button>
    </div>
  </Col>
</Row>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default BranchTarget;
