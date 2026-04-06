import styled from "styled-components";
import { colors } from "./theme.js";

const Row = styled.div`
  display: inline-flex;
  gap: 0.125rem;
  align-items: center;
`;

const StarBtn = styled.button<{ $active: boolean }>`
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
  color: ${(p) => (p.$active ? colors.star : colors.primaryLight)};
  transition: color 0.15s ease;

  &:disabled {
    cursor: default;
  }
`;

export type RatingStarsProps = {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
};

export function RatingStars({
  value,
  max = 5,
  onChange,
  readOnly = false,
}: RatingStarsProps) {
  return (
    <Row role="group" aria-label="Rating">
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        const active = n <= value;
        return (
          <StarBtn
            key={n}
            type="button"
            $active={active}
            disabled={readOnly || !onChange}
            aria-label={`${n} stars`}
            onClick={() => onChange?.(n)}
          >
            ★
          </StarBtn>
        );
      })}
    </Row>
  );
}
