
import React, { useMemo } from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import { useSelector } from "react-redux";

const formatAmount = (value) =>
  Number(value).toLocaleString("en-KE", {
    maximumFractionDigits: 0,
  });

const BranchTarget = ({
  // July
  julyBranchTargetSyokimau,
  julyBranchTargetTassia,
  julyBranchTargetMachakos,
  julyBranchTargetMtwapa,
  julyBranchTargetKasarani,
  julyBranchTargetEldoret,
  julyBranchTargetBusia,
  julyBranchTargetMsaGpo,
  julyBranchTargetKitale,
  julyBranchTargetKisii,

  // August
  augustBranchTargetSyokimau,
  augustBranchTargetTassia,
  augustBranchTargetMachakos,
  augustBranchTargetMtwapa,
  augustBranchTargetKasarani,
  augustBranchTargetEldoret,
  augustBranchTargetBusia,
  augustBranchTargetMsaGpo,
  augustBranchTargetKitale,
  augustBranchTargetKisii,

  // September
  septemberBranchTargetSyokimau,
  septemberBranchTargetTassia,
  septemberBranchTargetMachakos,
  septemberBranchTargetMtwapa,
  septemberBranchTargetKasarani,
  septemberBranchTargetEldoret,
  septemberBranchTargetBusia,
  septemberBranchTargetMsaGpo,
  septemberBranchTargetKitale,
  septemberBranchTargetKisii,

  // October
  octoberBranchTargetSyokimau,
  octoberBranchTargetTassia,
  octoberBranchTargetMachakos,
  octoberBranchTargetMtwapa,
  octoberBranchTargetKasarani,
  octoberBranchTargetEldoret,
  octoberBranchTargetBusia,
  octoberBranchTargetMsaGpo,
  octoberBranchTargetKitale,
  octoberBranchTargetKisii,

  selectedBranchName,
  error,
  loading,
  rightClickBtn,
}) => {
  const { startDate, endDate } = useSelector(
    (state) => state.salesTarget.filters
  );

  const branchData = useMemo(() => {
    const branches = [
      {
        branchID: 1,
        branchName: "Syokimau",
        july: julyBranchTargetSyokimau,
        august: augustBranchTargetSyokimau,
        september: septemberBranchTargetSyokimau,
        october: octoberBranchTargetSyokimau,
      },
      {
        branchID: 2,
        branchName: "Tassia",
        july: julyBranchTargetTassia,
        august: augustBranchTargetTassia,
        september: septemberBranchTargetTassia,
        october: octoberBranchTargetTassia,
      },
      {
        branchID: 3,
        branchName: "Machakos",
        july: julyBranchTargetMachakos,
        august: augustBranchTargetMachakos,
        september: septemberBranchTargetMachakos,
        october: octoberBranchTargetMachakos,
      },
      {
        branchID: 4,
        branchName: "Mtwapa",
        july: julyBranchTargetMtwapa,
        august: augustBranchTargetMtwapa,
        september: septemberBranchTargetMtwapa,
        october: octoberBranchTargetMtwapa,
      },
      {
        branchID: 5,
        branchName: "Kasarani",
        july: julyBranchTargetKasarani,
        august: augustBranchTargetKasarani,
        september: septemberBranchTargetKasarani,
        october: octoberBranchTargetKasarani,
      },
      {
        branchID: 6,
        branchName: "Eldoret",
        july: julyBranchTargetEldoret,
        august: augustBranchTargetEldoret,
        september: septemberBranchTargetEldoret,
        october: octoberBranchTargetEldoret,
      },
      {
        branchID: 7,
        branchName: "Busia",
        july: julyBranchTargetBusia,
        august: augustBranchTargetBusia,
        september: septemberBranchTargetBusia,
        october: octoberBranchTargetBusia,
      },
      {
        branchID: 8,
        branchName: "Msa GPO",
        july: julyBranchTargetMsaGpo,
        august: augustBranchTargetMsaGpo,
        september: septemberBranchTargetMsaGpo,
        october: octoberBranchTargetMsaGpo,
      },
      {
        branchID: 9,
        branchName: "Kitale",
        july: julyBranchTargetKitale,
        august: augustBranchTargetKitale,
        september: septemberBranchTargetKitale,
        october: octoberBranchTargetKitale,
      },
      {
        branchID: 10,
        branchName: "Kisii",
        july: julyBranchTargetKisii,
        august: augustBranchTargetKisii,
        september: septemberBranchTargetKisii,
        october: octoberBranchTargetKisii,
      },
    ];

    return branches.map((branch) => {
      const july = branch.july;
      const august = branch.august;
      const september = branch.september;
      const october = branch.october;

      return {
        branchID: branch.branchID,
        branchName:
          july?.branchName ||
          august?.branchName ||
          september?.branchName ||
          october?.branchName ||
          branch.branchName,

        julySalesIncl: july?.actualSalesIncl ?? null,
        julyTarget: july?.targetSales ?? null,

        augustSalesIncl: august?.actualSalesIncl ?? null,
        augustTarget: august?.targetSales ?? null,

        septemberSalesIncl: september?.actualSalesIncl ?? null,
        septemberTarget: september?.targetSales ?? null,

        octoberSalesIncl: october?.actualSalesIncl ?? null,
        octoberTarget: october?.targetSales ?? null,
      };
    });
  }, [
    julyBranchTargetSyokimau,
    julyBranchTargetTassia,
    julyBranchTargetMachakos,
    julyBranchTargetMtwapa,
    julyBranchTargetKasarani,
    julyBranchTargetEldoret,
    julyBranchTargetBusia,
    julyBranchTargetMsaGpo,
    julyBranchTargetKitale,
    julyBranchTargetKisii,
    augustBranchTargetSyokimau,
    augustBranchTargetTassia,
    augustBranchTargetMachakos,
    augustBranchTargetMtwapa,
    augustBranchTargetKasarani,
    augustBranchTargetEldoret,
    augustBranchTargetBusia,
    augustBranchTargetMsaGpo,
    augustBranchTargetKitale,
    augustBranchTargetKisii,
    septemberBranchTargetSyokimau,
    septemberBranchTargetTassia,
    septemberBranchTargetMachakos,
    septemberBranchTargetMtwapa,
    septemberBranchTargetKasarani,
    septemberBranchTargetEldoret,
    septemberBranchTargetBusia,
    septemberBranchTargetMsaGpo,
    septemberBranchTargetKitale,
    septemberBranchTargetKisii,
    octoberBranchTargetSyokimau,
    octoberBranchTargetTassia,
    octoberBranchTargetMachakos,
    octoberBranchTargetMtwapa,
    octoberBranchTargetKasarani,
    octoberBranchTargetEldoret,
    octoberBranchTargetBusia,
    octoberBranchTargetMsaGpo,
    octoberBranchTargetKitale,
    octoberBranchTargetKisii,
  ]);

  const formatMonthlyAmount = (value) =>
    value !== null && value !== undefined && value !== ""
      ? formatAmount(value)
      : "N/A";

  return (
    <div>
      {/* <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
        <h5 className="card-title mb-0">BRANCH SALES TARGETS</h5>

        <div className="d-flex align-items-center gap-2">
          <span>Filtered From:</span>
          <strong>{startDate || "-"}</strong>
          <span>to</span>
          <strong>{endDate || "-"}</strong>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span>Selected Branch:</span>
          <strong>{selectedBranchName || "All Branches"}</strong>
        </div>

        <div className="no-print">
          <button
            type="button"
            className="btn btn-caramel d-flex align-items-center gap-2 layout-rightside-btn"
            onClick={rightClickBtn}
          >
            <i className="ri-filter-fill" />
            Filter
          </button>
        </div>
      </div> */}

      <Card className="card-height-100">
        <CardHeader>
          <h4 className="card-title mb-1">
            Branch Sales Target Performance
          </h4>
          <p className="text-muted mb-0 fs-6">
            Monthly sales inclusive of tax compared with targets
          </p>
        </CardHeader>

        <CardBody>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="text-muted mt-2 mb-0">
                Loading branch performance...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-5">
              <p className="text-danger mb-0">
                {typeof error === "string"
                  ? error
                  : error.message || "Failed to load branch performance."}
              </p>
            </div>
          ) : (
            <div className="table-responsive table-card">
              <table className="table align-middle table-nowrap mb-0">
                <thead className="table-light">
                  <tr>
                    <th rowSpan={2} className="align-middle">
                      Branch
                    </th>
                    <th colSpan={2} className="text-center">July</th>
                    <th colSpan={2} className="text-center">August</th>
                    <th colSpan={2} className="text-center">September</th>
                    <th colSpan={2} className="text-center">October</th>
                  </tr>
                  <tr>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <React.Fragment key={index}>
                        <th className="text-end">Sales Incl. Tax (KES)</th>
                        <th className="text-end">Target (KES)</th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {branchData.map((item) => (
                    <tr key={item.branchID}>
                      <td className="fw-medium">{item.branchName}</td>
                      <td className="text-end">{formatMonthlyAmount(item.julySalesIncl)}</td>
                      <td className="text-end">{formatMonthlyAmount(item.julyTarget)}</td>
                      <td className="text-end">{formatMonthlyAmount(item.augustSalesIncl)}</td>
                      <td className="text-end">{formatMonthlyAmount(item.augustTarget)}</td>
                      <td className="text-end">{formatMonthlyAmount(item.septemberSalesIncl)}</td>
                      <td className="text-end">{formatMonthlyAmount(item.septemberTarget)}</td>
                      <td className="text-end">{formatMonthlyAmount(item.octoberSalesIncl)}</td>
                      <td className="text-end">{formatMonthlyAmount(item.octoberTarget)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default BranchTarget;
