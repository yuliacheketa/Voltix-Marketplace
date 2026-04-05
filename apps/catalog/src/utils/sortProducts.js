export function sortProducts(list, sort) {
  const out = [...list];
  if (sort === "price_asc") {
    out.sort((a, b) => a.price - b.price);
  } else if (sort === "price_desc") {
    out.sort((a, b) => b.price - a.price);
  } else if (sort === "rating") {
    out.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  } else if (sort === "newest") {
    out.sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime()
    );
  }
  return out;
}
