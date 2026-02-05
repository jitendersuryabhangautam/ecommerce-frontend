const normalize = (value) => (value || "").toLowerCase().trim();

const prefixSlice = (term, length) => term.slice(0, length);

const editDistance = (a, b) => {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;
  const dp = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[a.length][b.length];
};

export const buildKeywordIndex = (keywords, maxPrefix = 8) => {
  const prefixMap = new Map();
  const buckets = new Map();
  const normalized = [];

  keywords.forEach((term) => {
    const lower = normalize(term);
    if (!lower) return;
    normalized.push({ lower, original: term });

    const bucketKey = lower.slice(0, Math.min(2, lower.length));
    if (!buckets.has(bucketKey)) buckets.set(bucketKey, []);
    buckets.get(bucketKey).push({ lower, original: term });

    const limit = Math.min(maxPrefix, lower.length);
    for (let i = 1; i <= limit; i += 1) {
      const key = lower.slice(0, i);
      if (!prefixMap.has(key)) prefixMap.set(key, []);
      prefixMap.get(key).push(term);
    }
  });

  return { prefixMap, buckets, normalized, maxPrefix };
};

export const searchKeywordIndex = (
  index,
  query,
  { limit = 6, fuzzyDistance = 1 } = {}
) => {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];

  const prefixKey = normalizedQuery.slice(
    0,
    Math.min(index.maxPrefix, normalizedQuery.length)
  );
  const exact = index.prefixMap.get(prefixKey) || [];
  if (exact.length >= limit) {
    return exact.slice(0, limit);
  }

  const bucketKey = normalizedQuery.slice(
    0,
    Math.min(2, normalizedQuery.length)
  );
  const candidates = index.buckets.get(bucketKey) || index.normalized;
  const fuzzyMatches = [];
  const targetLength = normalizedQuery.length;

  for (const item of candidates) {
    const candidatePrefix = prefixSlice(item.lower, targetLength);
    const distance = editDistance(normalizedQuery, candidatePrefix);
    if (distance <= fuzzyDistance) {
      fuzzyMatches.push(item.original);
    }
    if (fuzzyMatches.length >= limit * 2) break;
  }

  const merged = [...exact, ...fuzzyMatches.filter((t) => !exact.includes(t))];
  return merged.slice(0, limit);
};
