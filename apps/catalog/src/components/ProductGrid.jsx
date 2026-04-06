import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import styled from "styled-components";
import { Spinner, colors } from "@voltix/ui-kit";
import { fetchProductsPage } from "../apiService/catalogApi.js";
import {
  buildProductFilters,
  parseCatalogSearchParams,
} from "../utils/catalogSearchParams.js";
import { sortProducts } from "../utils/sortProducts.js";
import { ProductCard } from "./ProductCard/ProductCard.jsx";

const PAGE_SIZE = 12;

const GridWrap = styled.div`
  width: 100%;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 1rem;
`;

const Sentinel = styled.div`
  height: 1px;
  margin-top: 1rem;
`;

const Message = styled.p`
  margin: 2rem 0;
  color: ${colors.muted};
  font-size: 0.9375rem;
`;

const ErrorText = styled.p`
  margin: 1rem 0;
  color: ${colors.danger};
  font-size: 0.9375rem;
`;

const LoadingRow = styled.div`
  display: flex;
  justify-content: center;
  padding: 1rem;
`;

export function ProductGrid() {
  const [searchParams] = useSearchParams();
  const sig = searchParams.toString();
  const [items, setItems] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setItems([]);
    setOffset(0);
    setHasMore(true);
    setError(null);
    setLoading(true);
    const filters = buildProductFilters(
      parseCatalogSearchParams(searchParams),
      0,
      PAGE_SIZE
    );
    fetchProductsPage(filters)
      .then((rows) => {
        if (cancelled) return;
        const list = rows ?? [];
        const sort = parseCatalogSearchParams(searchParams).sort;
        const sorted = sortProducts(list, sort);
        setItems(sorted);
        setOffset(list.length);
        setHasMore(list.length === PAGE_SIZE);
      })
      .catch((e) => {
        if (!cancelled) setError(e);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sig]);

  const loadMore = useCallback(async () => {
    if (!hasMore) return;
    setLoadingMore(true);
    try {
      const filters = buildProductFilters(
        parseCatalogSearchParams(searchParams),
        offset,
        PAGE_SIZE
      );
      const rows = await fetchProductsPage(filters);
      const list = rows ?? [];
      setItems((prev) =>
        sortProducts(
          [...prev, ...list],
          parseCatalogSearchParams(searchParams).sort
        )
      );
      setOffset((o) => o + list.length);
      setHasMore(list.length === PAGE_SIZE);
      setError(null);
    } catch (e) {
      setError(e);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, offset, searchParams]);

  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;

  const { ref: sentinelRef, inView } = useInView({
    threshold: 0,
    rootMargin: "120px",
  });

  useEffect(() => {
    if (!inView || !hasMore || loading || loadingMore) return;
    void loadMoreRef.current();
  }, [inView, hasMore, loading, loadingMore]);

  if (error && items.length === 0 && !loading) {
    return (
      <GridWrap>
        <ErrorText>
          {error.message || "Не вдалося завантажити товари. Перевірте API_URL."}
        </ErrorText>
      </GridWrap>
    );
  }

  return (
    <GridWrap>
      {loading && items.length === 0 ? (
        <LoadingRow>
          <Spinner aria-label="Завантаження" />
        </LoadingRow>
      ) : null}
      {!loading && items.length === 0 ? (
        <Message>Немає товарів за обраними фільтрами.</Message>
      ) : null}
      <Grid>
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </Grid>
      {items.length > 0 ? <Sentinel ref={sentinelRef} aria-hidden /> : null}
      {loadingMore ? (
        <LoadingRow>
          <Spinner aria-label="Завантаження ще" />
        </LoadingRow>
      ) : null}
    </GridWrap>
  );
}
