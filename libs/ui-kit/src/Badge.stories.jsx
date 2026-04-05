import { Badge } from "./Badge";

export default {
  title: "UI/Badge",
  component: Badge,
};

export const Neutral = { args: { children: "New", tone: "neutral" } };
export const Success = { args: { children: "In stock", tone: "success" } };
export const Warning = { args: { children: "Low", tone: "warning" } };
export const Danger = { args: { children: "Sale", tone: "danger" } };
