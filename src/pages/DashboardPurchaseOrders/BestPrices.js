import React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import { exportToExcel } from "../../helpers/export_helper";
import CardExportButtons from "../../Components/Common/CardExportButtons";

const BestPrices = ({
  bestPricePerSupplier = [],
}) => {
  const handleExportExcel = () => {
    const rows = (bestPricePerSupplier || []).map((item) => ({
      Supplier: item.supplierName || "",
      "Spend (KES)": Number(item.totalSpend || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    }));
    const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    exportToExcel(rows, `Best_Price_Per_Supplier_${todayStr}`);
  };

  return (
    <React.Fragment>
      <Card className="card-height-100" id="purchases-best-prices-card">
        <CardHeader className="card-header align-items-center d-flex justify-content-between flex-wrap gap-2">
          <h4 className="card-title mb-0 flex-grow-1">
            Best Price Per Supplier
          </h4>
          <CardExportButtons
            targetId="purchases-best-prices-card"
            title="Best Prices Per Supplier"
            onExport={handleExportExcel}
          />
        </CardHeader>

        <CardBody>
          {bestPricePerSupplier.length === 0 ? (
            <div className="text-center py-4">
              <h6 className="text-muted mb-1">
                No best price data available
              </h6>
            </div>
          ) : (
        <div className="table-responsive table-card">
              <table className="table align-middle table-nowrap mb-0">
                <thead className="table-light">
                  <tr className="text-muted">
                
                    <th>Supplier</th>
                    <th>Spend(KES)</th>
                  </tr>
                </thead>

                <tbody>
                  {bestPricePerSupplier.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="fw-medium">
                          {item.supplierName}
                        </div>
                      </td>

                      <td>
                      
                        {Number(
                          item.totalSpend || 0
                        ).toLocaleString("en-KE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default BestPrices;
