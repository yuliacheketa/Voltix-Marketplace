import type { HTMLAttributes } from "react";
import styled, { css } from "styled-components";
import { colors } from "./theme.js";

export type BadgeTone = "neutral" | "success" | "warning" | "danger";

const Tag = styled.span<{ $tone: BadgeTone }>`
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;

  ${(p) =>
    p.$tone === "neutral" &&
    css`
      background: ${colors.secondaryBg};
      color: ${colors.secondaryText};
    `}

  ${(p) =>
    p.$tone === "success" &&
    css`
      background: ${colors.successBg};
      color: ${colors.successText};
    `}

  ${(p) =>
    p.$tone === "warning" &&
    css`
      background: ${colors.warningBg};
      color: ${colors.warningText};
    `}

  ${(p) =>
    p.$tone === "danger" &&
    css`
      background: ${colors.dangerBg};
      color: ${colors.danger};
    `}
`;

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export function Badge({ tone = "neutral", children, ...rest }: BadgeProps) {
  return (
    <Tag $tone={tone} {...rest}>
      {children}
    </Tag>
  );
}
