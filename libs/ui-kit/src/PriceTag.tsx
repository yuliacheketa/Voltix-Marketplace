import styled from "styled-components";
import { formatPrice } from "@voltix/utils";
import { colors } from "./theme.js";

const Text = styled.span<{ $large?: boolean }>`
  font-weight: 700;
  color: ${colors.text};
  font-size: ${(p) => (p.$large ? "1.25rem" : "1rem")};
`;

export type PriceTagProps = {
  amount: number;
  currency: string;
  large?: boolean;
  className?: string;
};

export function PriceTag({
  amount,
  currency,
  large,
  className,
}: PriceTagProps) {
  return (
    <Text $large={large} className={className}>
      {formatPrice(amount, currency)}
    </Text>
  );
}
