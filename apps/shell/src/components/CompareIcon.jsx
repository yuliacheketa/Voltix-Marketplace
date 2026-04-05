import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useCompareStore } from "@voltix/shared-state/hooks";

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
  background: #3b82f6;
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

export function CompareIcon() {
  const count = useCompareStore((s) => s.products.length);
  return (
    <IconLink to="/compare" aria-label="Open compare">
      <Svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10 3H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm0 10H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1zM20 3h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm0 10h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1z" />
      </Svg>
      {count > 0 ? <Badge>{count > 99 ? "99+" : count}</Badge> : null}
    </IconLink>
  );
}
