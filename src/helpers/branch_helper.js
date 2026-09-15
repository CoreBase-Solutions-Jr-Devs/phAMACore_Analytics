const BRANCHES_CACHE_KEY = "phAMACore_cached_branches";
const ACTIVE_BRANCH_PREFIX = "phAMACore_active_branch_";

/**
 * Persists an array or map of branch objects into localStorage.
 * Handles different branch API key variants (branchCode, bcode, branch_ID, branchName, brancH_NAME, branch_name).
 */
export const saveCachedBranches = (branches) => {
  if (!branches) return;
  try {
    const list = Array.isArray(branches) ? branches : Object.values(branches);
    if (!list.length) return;

    const existing = getCachedBranchesMap();
    list.forEach((b) => {
      if (!b) return;
      const code = b.branchCode ?? b.bcode ?? b.branch_ID;
      const name = b.branchName ?? b.brancH_NAME ?? b.branch_name;
      if (code != null && name) {
        existing[String(code)] = String(name).trim();
      }
    });
    localStorage.setItem(BRANCHES_CACHE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error("Error saving cached branches to localStorage:", e);
  }
};

/**
 * Retrieves the cached branch map { [branchCode]: branchName } from localStorage.
 */
export const getCachedBranchesMap = () => {
  try {
    const data = localStorage.getItem(BRANCHES_CACHE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
};

/**
 * Retrieves the cached branch name for a specific branch code.
 */
export const getCachedBranchName = (branchCode) => {
  if (branchCode == null) return "";
  const map = getCachedBranchesMap();
  return map[String(branchCode)] || "";
};

/**
 * Saves the active/selected branch code for a specific section (e.g., 'sales', 'stock', 'purchase').
 */
export const saveActiveBranch = (section, branchCode) => {
  if (!section) return;
  try {
    if (branchCode == null) {
      localStorage.removeItem(`${ACTIVE_BRANCH_PREFIX}${section}`);
    } else {
      localStorage.setItem(`${ACTIVE_BRANCH_PREFIX}${section}`, String(branchCode));
    }
  } catch (e) {
    console.error("Error saving active branch to localStorage:", e);
  }
};

/**
 * Gets the active/selected branch code for a specific section from localStorage.
 */
export const getActiveBranch = (section) => {
  if (!section) return null;
  try {
    const val = localStorage.getItem(`${ACTIVE_BRANCH_PREFIX}${section}`);
    return val ? Number(val) : null;
  } catch (e) {
    return null;
  }
};

/**
 * Resolves the display branch name given a branch code, checking:
 * 1. Primary branches array from Redux
 * 2. Fallback transaction items array (sales, purchase orders, etc.)
 * 3. LocalStorage branch cache
 * 4. Fallback string `Branch ${branchCode}`
 */
export const resolveBranchName = (branchCode, branchesList = [], fallbackList = []) => {
  if (branchCode == null) return "";
  const codeNum = Number(branchCode);

  // 1. Primary branches list
  if (Array.isArray(branchesList) && branchesList.length > 0) {
    const match = branchesList.find(
      (b) => Number(b?.branchCode ?? b?.bcode ?? b?.branch_ID) === codeNum
    );
    const name = match?.branchName ?? match?.brancH_NAME ?? match?.branch_name;
    if (name) {
      // Refresh cache
      saveCachedBranches([{ branchCode: codeNum, branchName: name }]);
      return name;
    }
  }

  // 2. Fallback transaction list
  if (Array.isArray(fallbackList) && fallbackList.length > 0) {
    const match = fallbackList.find(
      (item) => Number(item?.branch_ID ?? item?.branchcode ?? item?.branchCode) === codeNum
    );
    const name = match?.brancch_Name ?? match?.branch_name ?? match?.branchName;
    if (name) {
      // Refresh cache
      saveCachedBranches([{ branchCode: codeNum, branchName: name }]);
      return name;
    }
  }

  // 3. Persistent LocalStorage cache
  const cached = getCachedBranchName(codeNum);
  if (cached) {
    return cached;
  }

  return `Branch ${codeNum}`;
};
