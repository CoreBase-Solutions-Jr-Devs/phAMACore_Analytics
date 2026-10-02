import React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import { exportToExcel } from "../../helpers/export_helper";
import CardExportButtons from "../../Components/Common/CardExportButtons";

const getColor = (percent) => {
  if (percent >= 75) return "bg-success";
  if (percent >= 50) return "bg-primary";
  if (percent >= 30) return "bg-warning";
  return "bg-danger";
};

const SalesByLocations = ({
  data = [],
  totalSpend,
  formatAmount,
}) => {
  const categoryTotal = data.reduce(
    (sum, item) => sum + Number(item.value || 0),
    0
  );

  const topCategory = data.length
    ? [...data].sort((a, b) => b.value - a.value)[0]
    : null;

  const handleExportExcel = () => {
    const rows = (data || []).map((item) => ({
      Category: item.name || "",
      "Spend (KES)": Number(item.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
    }));
    const todayStr = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    exportToExcel(rows, `Spend_By_Category_${todayStr}`);
  };

  return (
     <React.Fragment>
        <Card className="card-height-100" id="purchases-category-spend-card">
      <CardHeader className="align-items-center d-flex justify-content-between flex-wrap gap-2">
        <h4 className="card-title mb-0 flex-grow-1">
          Spend by Category
        </h4>
        <CardExportButtons
          targetId="purchases-category-spend-card"
          title="Spend by Category"
          onExport={handleExportExcel}
        />
      </CardHeader>

       <CardBody >        {data.length === 0 ? (
          <div className="text-center py-5">
            <h6 className="text-muted mb-2">
              No category data available
            </h6>
          </div>
        ) : (
          <>
            {data.map((item) => {
              const percent = categoryTotal
                ? (Number(item.value) / categoryTotal) * 100
                : 0;

              const color = getColor(percent);

              console.log(
                item.name,
                "value:",
                item.value,
                "percent:",
                percent,
                "color:",
                color
              );

              return (
                <div key={item.name} className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span className="text-uppercase">
                      {item.name}
                    </span>

                    <span className="text-muted">
                      KES {Number(item.value).toLocaleString("en-KE")}
                    </span>
                  </div>

                  <div
                    className="progress mt-2"
                    style={{ height: "20px" }}
                  >
                    <div
                      className={`progress-bar progress-bar-striped ${color}`}
                      role="progressbar"
                      style={{
                        width: `${percent}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}

            <hr className="my-2" />

            {topCategory && (
              <div className="d-flex flex-row align-items-center justify-content-center mb-2 gap-3">
                <p>
                  Top spending category:
                  <strong> {topCategory.name}</strong>
                </p>

                <p>
                  Spend:
                  <strong>
                    KES {Number(topCategory.value).toLocaleString("en-KE")}
                  </strong>
                </p>
              </div>
            )}
          </>
        )}
      </CardBody>
    </Card>
    </React.Fragment>
  );
};

export default SalesByLocations;