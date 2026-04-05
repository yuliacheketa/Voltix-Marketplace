import type { InputHTMLAttributes } from "react";
import styled from "styled-components";
import { colors } from "./theme.js";

const Field = styled.input`
  font-family: inherit;
  font-size: 1rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid ${colors.ghostBorder};
  color: ${colors.text};
  background: ${colors.surface};
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: 2px solid ${colors.primary};
    outline-offset: 0;
    border-color: ${colors.primary};
  }

  &::placeholder {
    color: ${colors.muted};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input(props: InputProps) {
  return <Field {...props} />;
}
