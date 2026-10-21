import type { Meta, StoryObj } from "@storybook/react-vite";

import HeroRight from "./hero-right";

const meta = {
  title: "Hero/HeroRight",
  component: HeroRight,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    imageSrc: {
      control: "text",
      description: "Hero right-side person image.",
    },
    titleAnnotation: {
      control: "text",
      description: "Handwritten annotation displayed above the impact card.",
    },
    metrics: {
      control: "object",
      description: "Impact metrics displayed inside the card.",
    },
  },
} satisfies Meta<typeof HeroRight>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    imageSrc: "/Sajid.png",
    titleAnnotation: "My Impact in Action",
  },
};

export const CustomTitle: Story = {
  args: {
    imageSrc: "/Sajid.png",
    titleAnnotation: "Technology Impact",
  },
};

export const CustomMetrics: Story = {
  args: {
    imageSrc: "/Sajid.png",
    titleAnnotation: "My Impact in Action",
    metrics: [
      {
        id: "reliability",
        value: "99.9%",
        label: "System Reliability",
        icon: "shield-check",
      },
      {
        id: "delivery",
        value: "Faster",
        label: "Delivery Speed",
        icon: "rocket",
      },
      {
        id: "cost",
        value: "Lower",
        label: "Operational Costs",
        icon: "shield-dollar",
      },
      {
        id: "security",
        value: "Stronger",
        label: "Security & Trust",
        icon: "shield-star",
      },
    ],
  },
};

export const AllMetricIcons: Story = {
  args: {
    imageSrc: "/Sajid.png",
    titleAnnotation: "Impact in Action",
    metrics: [
      {
        id: "shield-check",
        value: "99.9%",
        label: "System Reliability",
        icon: "shield-check",
      },
      {
        id: "rocket",
        value: "Faster",
        label: "Time to Market",
        icon: "rocket",
      },
      {
        id: "shield-dollar",
        value: "Lower",
        label: "Operational Costs",
        icon: "shield-dollar",
      },
      {
        id: "shield-star",
        value: "Stronger",
        label: "Security & Trust",
        icon: "shield-star",
      },
    ],
  },
};
