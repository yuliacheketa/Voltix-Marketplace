import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import styled from "styled-components";
import { Badge } from "@voltix/ui-kit";
import { useSellerProfile } from "../hooks/useSellerProfile";

const Shell = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 0.5rem;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const Aside = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Brand = styled.div`
  padding: 0.75rem;
  background: #fff;
  border: 1px solid #e8e8f4;
  border-radius: 0.5rem;
  font-weight: 700;
  font-size: 0.95rem;
`;

const SideLink = styled(NavLink)`
  padding: 0.55rem 0.8rem;
  border-radius: 0.45rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: #2a2a48;
  text-decoration: none;
  background: #fff;
  border: 1px solid #e0e0f0;

  &.active {
    background: linear-gradient(135deg, #333399 0%, #4a4ab5 100%);
    color: #fafaff;
    border-color: transparent;
  }

  &:hover:not(.active) {
    background: #f4f4fc;
  }
`;

const Main = styled.main`
  min-width: 0;
`;

function statusTone(s: string): "neutral" | "success" | "warning" | "danger" {
  if (s === "ACTIVE") return "success";
  if (s === "PENDING") return "warning";
  if (s === "SUSPENDED" || s === "BANNED") return "danger";
  return "neutral";
}

export function SellerLayout() {
  const { profile } = useSellerProfile();

  return (
    <Shell>
      <Aside>
        <Brand>
          <div>{profile.shopName}</div>
          <Badge tone={statusTone(profile.status)}>{profile.status}</Badge>
        </Brand>
        <SideLink to="/seller" end>
          Dashboard
        </SideLink>
        <SideLink to="/seller/products">Products</SideLink>
        <SideLink to="/seller/orders">Orders</SideLink>
        <SideLink to="/seller/settings">Shop Settings</SideLink>
      </Aside>
      <Main>
        <Outlet />
      </Main>
    </Shell>
  );
}
