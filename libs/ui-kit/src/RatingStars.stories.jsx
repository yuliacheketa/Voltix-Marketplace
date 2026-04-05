import { useState } from "react";
import { RatingStars } from "./RatingStars";

function Interactive() {
  const [v, setV] = useState(3);
  return <RatingStars value={v} onChange={setV} />;
}

export default {
  title: "UI/RatingStars",
  component: RatingStars,
};

export const ReadOnly = { args: { value: 4, readOnly: true } };
export const InteractiveStory = { render: () => <Interactive /> };
