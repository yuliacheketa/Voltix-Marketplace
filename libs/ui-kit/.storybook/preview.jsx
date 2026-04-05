import { colors } from "../src/theme.ts";

const preview = {
  parameters: {
    layout: "centered",
    controls: { expanded: true },
    backgrounds: {
      default: "voltix",
      values: [
        { name: "voltix", value: colors.pageBg },
        { name: "surface", value: colors.surface },
        { name: "wash", value: colors.primaryWash },
      ],
    },
  },
};

export default preview;
