import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useCartStore } from "@voltix/shared-state/hooks";

const IconLink = styled(Link)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  background: rgb(255 255 255 / 0.12);
  color: #f0f0f8;
  text-decoration: none;
  border: none;
  cursor: pointer;

  &:hover {
    background: rgb(255 255 255 / 0.22);
  }
`;

const Badge = styled.span`
  position: absolute;
  top: -0.2rem;
  right: -0.2rem;
  min-width: 1.1rem;
  height: 1.1rem;
  padding: 0 0.3rem;
  border-radius: 999px;
  background: #f97316;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  line-height: 1.1rem;
  text-align: center;
`;

const Svg = styled.svg`
  width: 1.25rem;
  height: 1.25rem;
  fill: currentColor;
`;

export function CartIcon() {
  const count = useCartStore((s) =>
    s.items.reduce((n, i) => n + i.quantity, 0)
  );
  return (
    <IconLink
      to={{ pathname: "/checkout", hash: "#/cart" }}
      aria-label="Відкрити кошик"
    >
      <Svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
      </Svg>
      {count > 0 ? <Badge>{count > 99 ? "99+" : count}</Badge> : null}
    </IconLink>
  );
}
