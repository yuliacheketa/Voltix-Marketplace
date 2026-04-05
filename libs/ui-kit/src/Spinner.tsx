import styled, { keyframes } from "styled-components";
import { colors } from "./theme.js";

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const Ring = styled.span<{ $size: number }>`
  display: inline-block;
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  border: 2px solid ${colors.ghostBorder};
  border-top-color: ${colors.primary};
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`;

export type SpinnerProps = {
  size?: number;
  className?: string;
};

export function Spinner({ size = 24, className }: SpinnerProps) {
  return (
    <Ring
      $size={size}
      className={className}
      role="status"
      aria-label="Loading"
    />
  );
}
