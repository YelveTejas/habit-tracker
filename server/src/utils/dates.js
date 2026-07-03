/** Date helpers - all dates are handled as YYYY-MM-DD strings to stay timezone-safe. */

export const toDateKey = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const addDays = (dateKey, n) => {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d + n);
  return toDateKey(dt);
};

export const todayKey = () => toDateKey(new Date());

/** Inclusive list of the last `n` day keys, ending today (ascending). */
export const lastNDays = (n) => {
  const out = [];
  const today = todayKey();
  for (let i = n - 1; i >= 0; i--) out.push(addDays(today, -i));
  return out;
};

export const isValidDateKey = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
