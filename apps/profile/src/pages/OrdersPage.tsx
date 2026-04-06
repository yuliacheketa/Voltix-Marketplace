import React, { useCallback, useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { Button } from "@voltix/ui-kit";
import { formatPrice } from "@voltix/utils";
import { getOrders, type OrderRow } from "../api/profile.api";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
`;

const Card = styled.article`
  background: #fff;
  border: 1px solid #e8e8f4;
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
`;

const CardHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;

const CardMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
`;

const IdMono = styled.span`
  font-family: ui-monospace, monospace;
  font-size: 0.85rem;
`;

const StatusTag = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;

  ${(p) =>
    p.$status === "PENDING" &&
    css`
      background: #e0e0e0;
      color: #424242;
    `}

  ${(p) =>
    (p.$status === "PAID" || p.$status === "PROCESSING") &&
    css`
      background: #e3f2fd;
      color: #1565c0;
    `}

  ${(p) =>
    p.$status === "SHIPPED" &&
    css`
      background: #fff8e1;
      color: #f57f17;
    `}

  ${(p) =>
    p.$status === "DELIVERED" &&
    css`
      background: #e8f5e9;
      color: #2e7d32;
    `}

  ${(p) =>
    (p.$status === "CANCELLED" || p.$status === "REFUNDED") &&
    css`
      background: #ffebee;
      color: #c62828;
    `}

  ${(p) =>
    ![
      "PENDING",
      "PAID",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
    ].includes(p.$status) &&
    css`
      background: #eceff1;
      color: #37474f;
    `}
`;

const TableWrap = styled.div`
  margin-top: 1rem;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;

  th,
  td {
    padding: 0.5rem 0.65rem;
    text-align: left;
    border-bottom: 1px solid #eeeef8;
  }

  th {
    font-weight: 600;
    color: #555;
  }
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const Muted = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const PaymentLine = styled(Muted)`
  display: block;
  margin-top: 0.5rem;
`;

function formatDdMmYyyy(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function truncateId(id: string): string {
  return id.length > 8 ? id.slice(0, 8) : id;
}

export function OrdersPage() {
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrders(page, 10);
      setOrders(data.orders);
      setTotalPages(data.pagination.totalPages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  function toggleRow(id: string) {
    setOpen((o) => ({ ...o, [id]: !o[id] }));
  }

  return (
    <Wrap>
      <Title>Замовлення</Title>
      {loading ? <Muted>Завантаження…</Muted> : null}
      {error ? <Muted>{error}</Muted> : null}
      {!loading && orders.length === 0 ? <Muted>Немає замовлень.</Muted> : null}
      {!loading &&
        orders.map((order) => (
          <Card key={order.id}>
            <CardHead>
              <CardMeta>
                <IdMono title={order.id}>{truncateId(order.id)}</IdMono>
                <StatusTag $status={order.status}>{order.status}</StatusTag>
                <span>{formatDdMmYyyy(order.createdAt)}</span>
                <strong>{formatPrice(Number(order.totalAmount), "UAH")}</strong>
              </CardMeta>
              <Button
                type="button"
                variant="ghost"
                onClick={() => toggleRow(order.id)}
              >
                {open[order.id] ? "Згорнути" : "Деталі"}
              </Button>
            </CardHead>
            {open[order.id] ? (
              <TableWrap>
                <Table>
                  <thead>
                    <tr>
                      <th>Товар</th>
                      <th>Варіант</th>
                      <th>Кількість</th>
                      <th>Ціна</th>
                      <th>Сума</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((it, idx) => (
                      <tr key={`${order.id}-${idx}`}>
                        <td>{it.productName}</td>
                        <td>{it.variantName ?? "—"}</td>
                        <td>{it.quantity}</td>
                        <td>{formatPrice(Number(it.unitPrice), "UAH")}</td>
                        <td>{formatPrice(Number(it.totalPrice), "UAH")}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {order.payment ? (
                  <PaymentLine>Оплата: {order.payment.status}</PaymentLine>
                ) : (
                  <PaymentLine>Оплата: —</PaymentLine>
                )}
              </TableWrap>
            ) : null}
          </Card>
        ))}
      <Pagination>
        <Button
          type="button"
          variant="secondary"
          disabled={page <= 1 || loading}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Назад
        </Button>
        <Muted>
          Сторінка {page}
          {totalPages > 0 ? ` з ${totalPages}` : ""}
        </Muted>
        <Button
          type="button"
          variant="secondary"
          disabled={loading || totalPages === 0 || page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Далі
        </Button>
      </Pagination>
    </Wrap>
  );
}
