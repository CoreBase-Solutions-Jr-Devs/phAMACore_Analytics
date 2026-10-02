import React from "react";
import { printElement } from "../../helpers/export_helper";

const CardExportButtons = ({
  onExport,
  targetId,
  title = "Report",
  className = "",
}) => {
  const handlePrint = (e) => {
    e.preventDefault();
    if (targetId) {
      printElement(targetId, title);
    } else {
      window.print();
    }
  };

  return (
    <div className={`d-flex align-items-center gap-1 no-print ${className}`}>
      {onExport && (
        <button
          type="button"
          className="btn btn-sm btn-soft-success d-flex align-items-center gap-1 py-1 px-2"
          onClick={onExport}
          title={`Export ${title} to Excel`}
        >
          <i className="ri-file-excel-2-line align-middle fs-13"></i>
          <span className="d-none d-sm-inline fs-11">Excel</span>
        </button>
      )}
      <button
        type="button"
        className="btn btn-sm btn-soft-info d-flex align-items-center gap-1 py-1 px-2"
        onClick={handlePrint}
        title={`Print ${title}`}
      >
        <i className="ri-printer-line align-middle fs-13"></i>
        <span className="d-none d-sm-inline fs-11">Print</span>
      </button>
    </div>
  );
};

export default CardExportButtons;
