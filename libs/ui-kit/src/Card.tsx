import type { HTMLAttributes } from "react";
import styled from "styled-components";
import { colors } from "./theme.js";

const Shell = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.ghostBorder};
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 2px rgb(15 23 42 / 0.06);
`;

export type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ children, ...rest }: CardProps) {
  return <Shell {...rest}>{children}</Shell>;
}
