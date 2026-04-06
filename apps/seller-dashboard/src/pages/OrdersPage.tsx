import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { Badge, Button } from "@voltix/ui-kit";
import { formatPrice } from "@voltix/utils";
import {
  getOrders,
  patchOrderStatus,
  type SellerOrderRow,
} from "../api/seller.api";

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
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
  }
`;

const InnerTable = styled.table`
  width: 100%;
  font-size: 0.8rem;
  margin-top: 0.5rem;
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

function truncateId(id: string) {
  return id.slice(0, 8);
}

function soTone(s: string): "neutral" | "success" | "warning" | "danger" {
  const m: Record<string, "neutral" | "success" | "warning" | "danger"> = {
    PENDING: "neutral",
    PROCESSING: "neutral",
    SHIPPED: "warning",
    DELIVERED: "success",
    CANCELLED: "danger",
    REFUNDED: "danger",
  };
  return m[s] ?? "neutral";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString();
}

export function OrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [rows, setRows] = useState<SellerOrderRow[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getOrders({
      page,
      limit: 20,
      status: status || undefined,
    });
    setRows(data.orders);
    setPagination(data.pagination);
    setLoading(false);
  }, [page, status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function advance(o: SellerOrderRow) {
    const next =
      o.status === "PENDING"
        ? "PROCESSING"
        : o.status === "PROCESSING"
          ? "SHIPPED"
          : null;
    if (!next) return;
    await patchOrderStatus(o.id, next);
    await load();
  }

  return (
    <div>
      <Title>Orders</Title>
      <Toolbar>
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </Toolbar>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <th />
              <th>ID</th>
              <th>Location</th>
              <th>Status</th>
              <th>Total</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <React.Fragment key={o.id}>
                <tr>
                  <td>
                    <button
                      type="button"
                      onClick={() =>
                        setOpen((s) => ({ ...s, [o.id]: !s[o.id] }))
                      }
                    >
                      {open[o.id] ? "−" : "+"}
                    </button>
                  </td>
                  <td>{truncateId(o.id)}</td>
                  <td>
                    {o.address.city}, {o.address.country}
                  </td>
                  <td>
                    <Badge tone={soTone(o.status)}>{o.status}</Badge>
                  </td>
                  <td>{formatPrice(Number(o.totalAmount), "UAH")}</td>
                  <td>{formatDate(o.createdAt)}</td>
                  <td>
                    {o.status === "PENDING" ? (
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => void advance(o)}
                      >
                        Mark as Processing
                      </Button>
                    ) : null}
                    {o.status === "PROCESSING" ? (
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => void advance(o)}
                      >
                        Mark as Shipped
                      </Button>
                    ) : null}
                  </td>
                </tr>
                {open[o.id] ? (
                  <tr>
                    <td colSpan={7}>
                      <InnerTable>
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Variant</th>
                            <th>Qty</th>
                            <th>Unit</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {o.items.map((it, i) => (
                            <tr key={i}>
                              <td>{it.productName}</td>
                              <td>{it.variantName ?? "—"}</td>
                              <td>{it.quantity}</td>
                              <td>
                                {formatPrice(Number(it.unitPrice), "UAH")}
                              </td>
                              <td>
                                {formatPrice(Number(it.totalPrice), "UAH")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </InnerTable>
                    </td>
                  </tr>
                ) : null}
              </React.Fragment>
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
          Page {pagination.page} / {Math.max(pagination.totalPages, 1)}
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
