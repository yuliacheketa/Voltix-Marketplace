export function getApiErrorMessage(err, fallback) {
  if (err && typeof err === "object" && "response" in err) {
    const data = err.response?.data;
    if (data?.message) return String(data.message);
    if (data?.errors && typeof data.errors === "object") {
      const flat = Object.values(data.errors).flat();
      const first = flat[0];
      if (first) return String(first);
    }
  }
  return fallback;
}
