import { Button } from "./Button";

export default {
  title: "UI/Button",
  component: Button,
  args: { children: "Button" },
};

export const Primary = { args: { variant: "primary" } };
export const Secondary = { args: { variant: "secondary" } };
export const Ghost = { args: { variant: "ghost" } };
