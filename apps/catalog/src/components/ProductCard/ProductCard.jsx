import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Button, Card, PriceTag, RatingStars, colors } from "@voltix/ui-kit";
import { useCartStore } from "@voltix/shared-state/hooks";

const StyledCard = styled(Card)`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  padding: 0;
`;

const Thumb = styled.div`
  aspect-ratio: 4 / 3;
  background: ${colors.primarySubtle};
  overflow: hidden;
`;

const ThumbImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const Body = styled.div`
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
`;

const TitleLink = styled(Link)`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${colors.text};
  text-decoration: none;
  line-height: 1.3;
  &:hover {
    text-decoration: underline;
    color: ${colors.primary};
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
`;

function primaryImage(product) {
  if (product.imageUrls?.length) return product.imageUrls[0];
  return product.imageUrl ?? "";
}

export function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const src = primaryImage(product);
  const rating = Math.min(5, Math.max(0, Math.round(product.rating ?? 0)));

  const onAddToCart = () => {
    addItem({
      productId: product.id,
      quantity: 1,
      title: product.title,
      unitPrice: product.price,
    });
  };

  return (
    <StyledCard>
      <Link to={`/product/${product.id}`} aria-label={product.title}>
        <Thumb>
          {src ? <ThumbImg src={src} alt="" loading="lazy" /> : null}
        </Thumb>
      </Link>
      <Body>
        <TitleLink to={`/product/${product.id}`}>{product.title}</TitleLink>
        <PriceTag amount={product.price} currency={product.currency} />
        <RatingStars value={rating} readOnly />
        <Actions>
          <Button type="button" variant="primary" onClick={onAddToCart}>
            До кошика
          </Button>
        </Actions>
      </Body>
    </StyledCard>
  );
}

export default ProductCard;
