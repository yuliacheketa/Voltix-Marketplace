import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Badge, Button, Input } from "@voltix/ui-kit";
import { patchSellerMe } from "../api/seller.api";
import { useSellerProfile } from "../hooks/useSellerProfile";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 520px;
  background: #fff;
  padding: 1.25rem;
  border: 1px solid #e8e8f4;
  border-radius: 0.65rem;
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-weight: 600;
  font-size: 0.85rem;
`;

const TextArea = styled.textarea`
  font-family: inherit;
  font-size: 1rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #d8d8e8;
  min-height: 100px;
`;

const ReadOnly = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f8f8fc;
  border-radius: 0.5rem;
  font-size: 0.9rem;
`;

const Title = styled.h1`
  margin: 0 0 1rem;
  font-size: 1.35rem;
`;

const Success = styled.p`
  margin: 0;
  padding: 0.5rem 0.75rem;
  background: #e8f5e9;
  color: #1b5e20;
  border-radius: 0.35rem;
  font-weight: 600;
`;

function statusHelp(status: string) {
  if (status === "PENDING") return "Under review";
  if (status === "ACTIVE") return "Active";
  if (status === "SUSPENDED") return "Suspended — contact support";
  if (status === "BANNED") return "Banned";
  return status;
}

export function ShopSettingsPage() {
  const { profile, setProfile } = useSellerProfile();
  const [shopName, setShopName] = useState(profile.shopName);
  const [description, setDescription] = useState(profile.description ?? "");
  const [logoUrl, setLogoUrl] = useState(profile.logoUrl ?? "");
  const [bannerUrl, setBannerUrl] = useState(profile.bannerUrl ?? "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setShopName(profile.shopName);
    setDescription(profile.description ?? "");
    setLogoUrl(profile.logoUrl ?? "");
    setBannerUrl(profile.bannerUrl ?? "");
  }, [profile]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    const updated = await patchSellerMe({
      shopName,
      description: description.trim() === "" ? null : description.trim(),
      logoUrl: logoUrl.trim() === "" ? null : logoUrl.trim(),
      bannerUrl: bannerUrl.trim() === "" ? null : bannerUrl.trim(),
    });
    setProfile(updated);
    setSaved(true);
  }

  return (
    <div>
      <Title>Shop settings</Title>
      <Form onSubmit={(e) => void onSubmit(e)}>
        <Field>
          Shop name
          <Input
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
          />
        </Field>
        <Field>
          Description
          <TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <Field>
          Logo URL
          <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
        </Field>
        <Field>
          Banner URL
          <Input
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
          />
        </Field>
        {saved ? <Success>Settings saved.</Success> : null}
        <Button type="submit" variant="primary">
          Save
        </Button>
      </Form>
      <ReadOnly>
        <div>
          Status: <Badge tone="neutral">{profile.status}</Badge> —{" "}
          {statusHelp(profile.status)}
        </div>
        <div>
          Verified:{" "}
          <Badge tone={profile.isVerified ? "success" : "neutral"}>
            {profile.isVerified ? "Yes" : "No"}
          </Badge>
        </div>
        <div>Total sales: {profile.totalSales}</div>
        <div>Rating: {profile.rating.toFixed(2)}</div>
        <div>Created: {new Date(profile.createdAt).toLocaleString()}</div>
      </ReadOnly>
    </div>
  );
}
