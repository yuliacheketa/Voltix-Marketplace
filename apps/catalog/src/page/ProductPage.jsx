import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import { Button, PriceTag, RatingStars, Spinner, colors } from "@voltix/ui-kit";
import { formatDate } from "@voltix/utils";
import { fetchProductById } from "../apiService/catalogApi.js";
import { useCartStore, useCompareStore } from "@voltix/shared-state";

const Page = styled.div`
  max-width: 56rem;
  margin: 0 auto;
  padding: 1rem 1.5rem 2rem;
  min-height: 100vh;
  background: ${colors.pageBg};
`;

const Back = styled(Link)`
  display: inline-block;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: ${colors.primary};
  text-decoration: none;
  font-weight: 600;
  &:hover {
    text-decoration: underline;
    color: ${colors.primaryHover};
  }
`;

const Layout = styled.div`
  display: grid;
  gap: 1.5rem;
  padding: 1.5rem;
  background: ${colors.surface};
  border-radius: 0.75rem;
  border: 1px solid ${colors.borderSubtle};
  box-shadow: 0 2px 12px rgb(${colors.shadowTint} / 0.08);
  @media (min-width: 48rem) {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
`;

const BelowFold = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: ${colors.surface};
  border-radius: 0.75rem;
  border: 1px solid ${colors.borderSubtle};
  box-shadow: 0 2px 12px rgb(${colors.shadowTint} / 0.08);
`;

const Gallery = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const MainImg = styled.div`
  aspect-ratio: 1;
  background: ${colors.primarySubtle};
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid ${colors.borderSubtle};
`;

const MainImgEl = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
`;

const Thumbs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const ThumbBtn = styled.button`
  padding: 0;
  border: 2px solid ${(p) => (p.$active ? colors.primary : "transparent")};
  border-radius: 0.25rem;
  overflow: hidden;
  cursor: pointer;
  width: 3.5rem;
  height: 3.5rem;
  background: ${colors.primaryWash};
`;

const ThumbImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const Title = styled.h1`
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  color: ${colors.text};
`;

const Desc = styled.p`
  margin: 0 0 1rem;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: ${colors.textSecondary};
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
`;

const SpecsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
`;

const SpecRow = styled.tr`
  border-bottom: 1px solid ${colors.borderSubtle};
`;

const SpecTh = styled.th`
  text-align: left;
  padding: 0.5rem 0.75rem 0.5rem 0;
  color: ${colors.muted};
  font-weight: 600;
  width: 40%;
`;

const SpecTd = styled.td`
  padding: 0.5rem 0;
  color: ${colors.text};
`;

const ReviewsTitle = styled.h2`
  margin: 0 0 0.75rem;
  font-size: 1.125rem;
  color: ${colors.text};
`;

const ReviewCard = styled.article`
  padding: 0.75rem 0;
  border-bottom: 1px solid ${colors.borderSubtle};
`;

const ReviewMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.35rem;
  font-size: 0.8125rem;
  color: ${colors.muted};
`;

const ReviewText = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: ${colors.textSecondary};
  line-height: 1.45;
`;

const RatingRow = styled.div`
  margin-top: 0.5rem;
`;

const SpecsHeading = styled.h2`
  margin: 0 0 0.75rem;
  font-size: 1.125rem;
  color: ${colors.text};
`;

const ReviewAuthor = styled.strong`
  color: ${colors.text};
`;

const EmptyReviews = styled.p`
  margin: 0;
  color: ${colors.muted};
  font-size: 0.875rem;
`;

const ErrorText = styled.p`
  color: ${colors.danger};
`;

function galleryUrls(product) {
  if (product.imageUrls?.length) return product.imageUrls;
  if (product.imageUrl) return [product.imageUrl];
  return [];
}

export function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const addItem = useCartStore((s) => s.addItem);
  const addProduct = useCompareStore((s) => s.addProduct);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setActiveIdx(0);
    fetchProductById(id)
      .then((data) => {
        if (!cancelled) setProduct(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <Page>
        <Spinner aria-label="Loading product" />
      </Page>
    );
  }

  if (error || !product) {
    return (
      <Page>
        <Back to="/">← Back to catalog</Back>
        <ErrorText>{error?.message || "Product not found."}</ErrorText>
      </Page>
    );
  }

  const urls = galleryUrls(product);
  const activeSrc = urls[activeIdx] ?? "";
  const rating = Math.min(5, Math.max(0, Math.round(product.rating ?? 0)));
  const attrs = product.attributes ?? {};
  const entries = Object.entries(attrs);
  const reviews = product.reviews ?? [];

  const onAddToCart = () => {
    addItem({
      productId: product.id,
      quantity: 1,
      title: product.title,
      unitPrice: product.price,
    });
  };

  const onCompare = () => {
    addProduct(product);
  };

  return (
    <Page>
      <Back to="/">← Back to catalog</Back>
      <Layout>
        <Gallery>
          <MainImg>
            {activeSrc ? <MainImgEl src={activeSrc} alt="" /> : null}
          </MainImg>
          {urls.length > 1 ? (
            <Thumbs>
              {urls.map((u, i) => (
                <ThumbBtn
                  key={u + i}
                  type="button"
                  $active={i === activeIdx}
                  onClick={() => setActiveIdx(i)}
                  aria-label={`Image ${i + 1}`}
                >
                  <ThumbImg src={u} alt="" />
                </ThumbBtn>
              ))}
            </Thumbs>
          ) : null}
        </Gallery>
        <div>
          <Title>{product.title}</Title>
          <PriceTag amount={product.price} currency={product.currency} />
          <RatingRow>
            <RatingStars value={rating} readOnly />
          </RatingRow>
          {product.description ? <Desc>{product.description}</Desc> : null}
          <Actions>
            <Button type="button" variant="primary" onClick={onAddToCart}>
              Add to cart
            </Button>
            <Button type="button" variant="secondary" onClick={onCompare}>
              Compare
            </Button>
          </Actions>
        </div>
      </Layout>
      <BelowFold>
        {entries.length > 0 ? (
          <>
            <SpecsHeading>Specifications</SpecsHeading>
            <SpecsTable>
              <tbody>
                {entries.map(([k, v]) => (
                  <SpecRow key={k}>
                    <SpecTh scope="row">{k}</SpecTh>
                    <SpecTd>{v}</SpecTd>
                  </SpecRow>
                ))}
              </tbody>
            </SpecsTable>
          </>
        ) : null}
        <ReviewsTitle>Reviews</ReviewsTitle>
        {reviews.length === 0 ? (
          <EmptyReviews>No reviews yet.</EmptyReviews>
        ) : (
          reviews.map((r) => (
            <ReviewCard key={r.id}>
              <ReviewMeta>
                <ReviewAuthor>{r.author}</ReviewAuthor>
                <RatingStars
                  value={Math.min(5, Math.round(r.rating))}
                  readOnly
                />
                <span>{formatDate(r.createdAt)}</span>
              </ReviewMeta>
              <ReviewText>{r.text}</ReviewText>
            </ReviewCard>
          ))
        )}
      </BelowFold>
    </Page>
  );
}
