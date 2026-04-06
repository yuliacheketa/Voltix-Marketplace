import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Badge, Button } from "@voltix/ui-kit";
import { formatPrice } from "@voltix/utils";
import { getOrders, getStats, type SellerOrderRow } from "../api/seller.api";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid #e8e8f4;
  border-radius: 0.65rem;
  padding: 1rem;
`;

const CardLabel = styled.div`
  font-size: 0.8rem;
  color: #666;
  font-weight: 600;
`;

const CardValue = styled.div`
  font-size: 1.35rem;
  font-weight: 700;
  margin-top: 0.35rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  background: #fff;
  border: 1px solid #e8e8f4;
  border-radius: 0.5rem;
  overflow: hidden;

  th,
  td {
    padding: 0.5rem 0.65rem;
    text-align: left;
    border-bottom: 1px solid #eeeef8;
  }
`;

const Title = styled.h1`
  margin: 0 0 1rem;
  font-size: 1.35rem;
`;

function truncateId(id: string) {
  return id.slice(0, 8);
}

function orderStatusTone(
  s: string
): "neutral" | "success" | "warning" | "danger" {
  const map: Record<string, "neutral" | "success" | "warning" | "danger"> = {
    PENDING: "neutral",
    PROCESSING: "neutral",
    SHIPPED: "warning",
    DELIVERED: "success",
    CANCELLED: "danger",
    REFUNDED: "danger",
  };
  return map[s] ?? "neutral";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString();
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Awaited<
    ReturnType<typeof getStats>
  > | null>(null);
  const [orders, setOrders] = useState<SellerOrderRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    async function load() {
      try {
        const [s, o] = await Promise.all([
          getStats(),
          getOrders({ page: 1, limit: 5 }),
        ]);
        if (!c) {
          setStats(s);
          setOrders(o.orders);
        }
      } catch (e) {
        if (!c) setErr(e instanceof Error ? e.message : "Error");
      }
    }
    void load();
    return () => {
      c = true;
    };
  }, []);

  if (err) return <p>{err}</p>;
  if (!stats) return <p>Loading…</p>;

  return (
    <div>
      <Title>Dashboard</Title>
      <Grid>
        <Card>
          <CardLabel>Total Revenue</CardLabel>
          <CardValue>
            {formatPrice(Number(stats.totalRevenue), "UAH")}
          </CardValue>
        </Card>
        <Card>
          <CardLabel>Total Orders</CardLabel>
          <CardValue>{stats.totalOrders}</CardValue>
        </Card>
        <Card>
          <CardLabel>Pending Orders</CardLabel>
          <CardValue>{stats.pendingOrders}</CardValue>
        </Card>
        <Card>
          <CardLabel>Active Products</CardLabel>
          <CardValue>{stats.totalProducts}</CardValue>
        </Card>
        <Card>
          <CardLabel>Average Rating</CardLabel>
          <CardValue>{stats.averageRating.toFixed(1)}</CardValue>
        </Card>
      </Grid>
      <h2 style={{ fontSize: "1.05rem", marginBottom: "0.5rem" }}>
        Recent orders
      </h2>
      <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Total</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr
              key={o.id}
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/seller/orders")}
            >
              <td>{truncateId(o.id)}</td>
              <td>
                <Badge tone={orderStatusTone(o.status)}>{o.status}</Badge>
              </td>
              <td>{formatPrice(Number(o.totalAmount), "UAH")}</td>
              <td>{formatDate(o.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div style={{ marginTop: "0.75rem" }}>
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate("/seller/orders")}
        >
          View all orders
        </Button>
      </div>
    </div>
  );
}
