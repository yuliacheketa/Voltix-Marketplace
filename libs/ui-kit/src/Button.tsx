import type { ButtonHTMLAttributes } from "react";
import styled, { css } from "styled-components";
import { colors } from "./theme.js";

export type ButtonVariant = "primary" | "secondary" | "ghost";

const StyledButton = styled.button<{ $variant: ButtonVariant }>`
  font-family: inherit;
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.25;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  border: 1px solid transparent;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${(p) =>
    p.$variant === "primary" &&
    css`
      background: ${colors.primary};
      color: #fff;
      &:hover:not(:disabled) {
        background: ${colors.primaryHover};
      }
    `}

  ${(p) =>
    p.$variant === "secondary" &&
    css`
      background: ${colors.secondaryBg};
      color: ${colors.secondaryText};
      &:hover:not(:disabled) {
        filter: brightness(0.95);
      }
    `}

  ${(p) =>
    p.$variant === "ghost" &&
    css`
      background: transparent;
      color: ${colors.text};
      border-color: ${colors.ghostBorder};
      &:hover:not(:disabled) {
        background: ${colors.secondaryBg};
      }
    `}
`;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({
  variant = "primary",
  type = "button",
  ...rest
}: ButtonProps) {
  return <StyledButton type={type} $variant={variant} {...rest} />;
}
