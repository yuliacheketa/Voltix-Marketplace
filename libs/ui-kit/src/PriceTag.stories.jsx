import { PriceTag } from "./PriceTag";

export default {
  title: "UI/PriceTag",
  component: PriceTag,
};

export const Default = { args: { amount: 1299.99, currency: "USD" } };
export const Large = { args: { amount: 49, currency: "EUR", large: true } };
