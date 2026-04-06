import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Badge, Button, Input } from "@voltix/ui-kit";
import { formatPrice } from "@voltix/utils";
import {
  archiveProduct,
  getProducts,
  type SellerProductRow,
} from "../api/seller.api";

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  background: #fff;
  border: 1px solid #e8e8f4;
  border-radius: 0.5rem;
  overflow: hidden;

  th,
  td {
    padding: 0.45rem 0.5rem;
    text-align: left;
    border-bottom: 1px solid #eeeef8;
    vertical-align: middle;
  }

  img {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 0.25rem;
  }
`;

const Title = styled.h1`
  margin: 0 0 1rem;
  font-size: 1.35rem;
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
`;

function statusTone(s: string): "neutral" | "success" | "warning" | "danger" {
  if (s === "DRAFT" || s === "ARCHIVED") return "neutral";
  if (s === "PENDING") return "warning";
  if (s === "ACTIVE") return "success";
  if (s === "REJECTED") return "danger";
  return "neutral";
}

export function ProductsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<SellerProductRow[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getProducts({
      page,
      status: status || undefined,
    });
    setRows(data.products);
    setPagination(data.pagination);
    setLoading(false);
  }, [page, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(q));
  }, [rows, search]);

  async function onArchive(id: string) {
    if (!window.confirm("Archive this product?")) return;
    await archiveProduct(id);
    await load();
  }

  return (
    <div>
      <Title>Products</Title>
      <Toolbar>
        <Input
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">All</option>
          <option value="DRAFT">Draft</option>
          <option value="PENDING">Pending</option>
          <option value="ACTIVE">Active</option>
          <option value="REJECTED">Rejected</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <Button
          type="button"
          variant="primary"
          onClick={() => navigate("/seller/products/new")}
        >
          Add product
        </Button>
      </Toolbar>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <th />
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Sold</th>
              <th>Rating</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.mainImageUrl ? (
                    <img src={p.mainImageUrl} alt="" />
                  ) : (
                    <span>—</span>
                  )}
                </td>
                <td>{p.name}</td>
                <td>{p.categoryName}</td>
                <td>{formatPrice(Number(p.basePrice), "UAH")}</td>
                <td>
                  <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                </td>
                <td>{p.totalSold}</td>
                <td>{p.rating.toFixed(1)}</td>
                <td>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate(`/seller/products/${p.id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void onArchive(p.id)}
                  >
                    Archive
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Pagination>
        <Button
          type="button"
          variant="secondary"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </Button>
        <span>
          Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
        </span>
        <Button
          type="button"
          variant="secondary"
          disabled={
            page >= pagination.totalPages || pagination.totalPages === 0
          }
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </Pagination>
    </div>
  );
}
