export const getSessionCache = (key) => {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setSessionCache = (key, value) => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
};

export const buildCacheKey = (prefix, params) => {
  const stable = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});
  return `${prefix}:${JSON.stringify(stable)}`;
};
