import React, { useState } from "react";

const BranchDropdown = () => {
  const [branch, setBranch] = useState("All Branches");

  const branches = [
    "All Branches",
    "Nairobi",
    "Kisumu",
    "Nakuru",
    "Thika",
    "Mombasa",
    "Eldoret",
  ];

  return (
    <div className="d-flex align-items-center gap-2">
      <label className="mb-0 fw-semibold text-muted small">
        Branch:
      </label>

      <select
        className="form-select form-select-sm w-auto"
        value={branch}
        onChange={(e) => setBranch(e.target.value)}
      >
        {branches.map((b, idx) => (
          <option key={idx} value={b}>
            {b}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BranchDropdown;