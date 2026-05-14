export function formatPrice(pkr) {
  if (!pkr) return 'Price N/A';
  if (pkr >= 10_000_000) return `PKR ${(pkr / 10_000_000).toFixed(2)} Crore`;
  if (pkr >= 100_000) return `PKR ${(pkr / 100_000).toFixed(1)} Lacs`;
  return `PKR ${pkr.toLocaleString()}`;
}

export function formatMileage(km) {
  if (!km) return 'N/A';
  return `${km.toLocaleString()} km`;
}

export function truncate(str, len = 80) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

export function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${base}${path}`;
}
