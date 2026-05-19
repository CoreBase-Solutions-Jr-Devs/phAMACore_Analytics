// ===============================
// FORMAT HELPERS
// ===============================

// API FORMAT: DD/MM/YYYY
export const formatToApiDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// UI FORMAT: YYYY-MM-DD (for input type="date")
export const formatToInputDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};

// ===============================
// TODAY / YESTERDAY
// ===============================

export const getTodayApi = () => {
  return formatToApiDate(new Date());
};

export const getTodayInput = () => {
  return formatToInputDate(new Date());
};

export const getYesterdayApi = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatToApiDate(d);
};

export const getYesterdayInput = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatToInputDate(d);
};

// ===============================
// LAST 7 DAYS
// ===============================

export const getLast7DaysApi = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 7);

  return {
    startDate: formatToApiDate(start),
    endDate: formatToApiDate(end),
  };
};

export const getLast7DaysInput = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 7);

  return {
    startDate: formatToInputDate(start),
    endDate: formatToInputDate(end),
  };
};