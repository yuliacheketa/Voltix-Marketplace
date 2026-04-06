import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { Button, Input } from "@voltix/ui-kit";
import axios from "axios";
import {
  createProduct,
  getCategories,
  getProduct,
  updateProduct,
  type CategoryOption,
} from "../api/seller.api";

const Section = styled.section`
  margin-bottom: 1.5rem;
  background: #fff;
  padding: 1rem;
  border: 1px solid #e8e8f4;
  border-radius: 0.5rem;
`;

const Title = styled.h1`
  margin: 0 0 1rem;
  font-size: 1.25rem;
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
  font-size: 0.85rem;
`;

const TextArea = styled.textarea`
  font-family: inherit;
  font-size: 1rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #d8d8e8;
  min-height: 120px;
`;

const Row = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
`;

const Err = styled.span`
  color: #c62828;
  font-size: 0.8rem;
`;

type ImgRow = { url: string; altText: string; isMain: boolean };
type AttrRow = { name: string; value: string };
type VarRow = {
  name: string;
  value: string;
  price: string;
  stock: string;
  sku: string;
};

function fieldErrorsFromAxios(e: unknown): Record<string, string> {
  if (!axios.isAxiosError(e) || !e.response?.data) return {};
  const d = e.response.data as {
    errors?: Record<string, string[]>;
    message?: string;
  };
  const out: Record<string, string> = {};
  if (d.errors && typeof d.errors === "object") {
    for (const [k, v] of Object.entries(d.errors)) {
      if (Array.isArray(v) && v[0]) out[k] = v[0];
    }
  }
  return out;
}

export function ProductFormPage() {
  const { id } = useParams();
  const loc = useLocation();
  const navigate = useNavigate();
  const isNew = loc.pathname.endsWith("/products/new");
  const isEdit = !isNew && Boolean(id);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [images, setImages] = useState<ImgRow[]>([
    { url: "", altText: "", isMain: true },
  ]);
  const [attributes, setAttributes] = useState<AttrRow[]>([]);
  const [variants, setVariants] = useState<VarRow[]>([
    { name: "", value: "", price: "", stock: "0", sku: "" },
  ]);
  const [loading, setLoading] = useState(isEdit && Boolean(id));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    void getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (!isEdit || !id) {
      setLoading(false);
      return;
    }
    let c = false;
    void getProduct(id).then((p) => {
      if (c) return;
      setName(p.name);
      setDescription(p.description);
      setBasePrice(p.basePrice);
      setCategoryId(p.categoryId);
      setImages(
        p.images.length
          ? p.images.map((im) => ({
              url: im.url,
              altText: im.altText ?? "",
              isMain: im.isMain,
            }))
          : [{ url: "", altText: "", isMain: true }]
      );
      setAttributes(
        p.attributes.map((a) => ({ name: a.name, value: a.value }))
      );
      setVariants(
        p.variants.map((v) => ({
          name: v.name,
          value: v.value,
          price: v.price,
          stock: String(v.stock),
          sku: v.sku ?? "",
        }))
      );
      setLoading(false);
    });
    return () => {
      c = true;
    };
  }, [isEdit, id]);

  function setMainImage(i: number) {
    setImages((rows) => rows.map((r, j) => ({ ...r, isMain: j === i })));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    const payload = {
      name: name.trim(),
      description: description.trim(),
      basePrice: Number(basePrice),
      categoryId,
      attributes:
        attributes.length > 0
          ? attributes.filter((a) => a.name && a.value)
          : undefined,
      variants: variants.map((v) => ({
        name: v.name,
        value: v.value,
        price: Number(v.price),
        stock: parseInt(v.stock, 10) || 0,
        sku: v.sku.trim() || undefined,
      })),
      images: images.map((im) => ({
        url: im.url.trim(),
        altText: im.altText.trim() || undefined,
        isMain: im.isMain,
      })),
    };
    try {
      if (isEdit && id) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }
      navigate("/seller/products");
    } catch (err) {
      setFieldErrors(fieldErrorsFromAxios(err));
    }
  }

  if (loading) return <p>Loading…</p>;

  return (
    <form onSubmit={(e) => void onSubmit(e)}>
      <Title>{isEdit ? "Edit product" : "New product"}</Title>
      <Section>
        <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Basic</h2>
        <Field>
          Name
          <Input value={name} onChange={(e) => setName(e.target.value)} />
          {fieldErrors.name ? <Err>{fieldErrors.name}</Err> : null}
        </Field>
        <Field>
          Description
          <TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {fieldErrors.description ? (
            <Err>{fieldErrors.description}</Err>
          ) : null}
        </Field>
        <Field>
          Base price
          <Input
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            type="number"
            step="0.01"
          />
          {fieldErrors.basePrice ? <Err>{fieldErrors.basePrice}</Err> : null}
        </Field>
        <Field>
          Category
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Select…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {fieldErrors.categoryId ? <Err>{fieldErrors.categoryId}</Err> : null}
        </Field>
      </Section>
      <Section>
        <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Images</h2>
        {images.map((im, i) => (
          <Row key={i}>
            <Input
              placeholder="URL"
              value={im.url}
              onChange={(e) => {
                const next = [...images];
                next[i] = { ...next[i], url: e.target.value };
                setImages(next);
              }}
            />
            <Input
              placeholder="Alt"
              value={im.altText}
              onChange={(e) => {
                const next = [...images];
                next[i] = { ...next[i], altText: e.target.value };
                setImages(next);
              }}
            />
            <label>
              <input
                type="radio"
                name="mainimg"
                checked={im.isMain}
                onChange={() => setMainImage(i)}
              />{" "}
              Main
            </label>
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setImages((rows) => rows.filter((_, j) => j !== i))
              }
            >
              Remove
            </Button>
          </Row>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            setImages((rows) => [
              ...rows,
              { url: "", altText: "", isMain: rows.length === 0 },
            ])
          }
        >
          Add image
        </Button>
        {fieldErrors.images ? <Err>{fieldErrors.images}</Err> : null}
      </Section>
      <Section>
        <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Attributes</h2>
        {attributes.map((a, i) => (
          <Row key={i}>
            <Input
              placeholder="Name"
              value={a.name}
              onChange={(e) => {
                const n = [...attributes];
                n[i] = { ...n[i], name: e.target.value };
                setAttributes(n);
              }}
            />
            <Input
              placeholder="Value"
              value={a.value}
              onChange={(e) => {
                const n = [...attributes];
                n[i] = { ...n[i], value: e.target.value };
                setAttributes(n);
              }}
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setAttributes((rows) => rows.filter((_, j) => j !== i))
              }
            >
              Remove
            </Button>
          </Row>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={() => setAttributes((r) => [...r, { name: "", value: "" }])}
        >
          Add attribute
        </Button>
      </Section>
      <Section>
        <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>Variants</h2>
        {variants.map((v, i) => (
          <Row key={i}>
            <Input
              placeholder="Name"
              value={v.name}
              onChange={(e) => {
                const n = [...variants];
                n[i] = { ...n[i], name: e.target.value };
                setVariants(n);
              }}
            />
            <Input
              placeholder="Value"
              value={v.value}
              onChange={(e) => {
                const n = [...variants];
                n[i] = { ...n[i], value: e.target.value };
                setVariants(n);
              }}
            />
            <Input
              placeholder="Price"
              value={v.price}
              onChange={(e) => {
                const n = [...variants];
                n[i] = { ...n[i], price: e.target.value };
                setVariants(n);
              }}
            />
            <Input
              placeholder="Stock"
              value={v.stock}
              onChange={(e) => {
                const n = [...variants];
                n[i] = { ...n[i], stock: e.target.value };
                setVariants(n);
              }}
            />
            <Input
              placeholder="SKU"
              value={v.sku}
              onChange={(e) => {
                const n = [...variants];
                n[i] = { ...n[i], sku: e.target.value };
                setVariants(n);
              }}
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setVariants((rows) => rows.filter((_, j) => j !== i))
              }
            >
              Remove
            </Button>
          </Row>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            setVariants((r) => [
              ...r,
              { name: "", value: "", price: "", stock: "0", sku: "" },
            ])
          }
        >
          Add variant
        </Button>
        {fieldErrors.variants ? <Err>{fieldErrors.variants}</Err> : null}
      </Section>
      <Button type="submit" variant="primary">
        {isEdit ? "Save changes" : "Save as Draft"}
      </Button>
    </form>
  );
}
