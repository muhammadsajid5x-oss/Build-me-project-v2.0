import type { Meta, StoryObj } from "@storybook/react-vite";
import HeroLeft from "./hero-left";

const meta = {
  title: "Web/Hero/HeroLeft",
  component: HeroLeft,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof HeroLeft>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomContent: Story = {
  args: {
    badge: "TECHNOLOGY OWNERSHIP",
    titlePrimary: "Build Better",
    titleSecondary: "Digital Experiences",
    subheading:
      "Simple, fast, and beautiful platforms that win and get real results",
    description:
      "Websites and apps that are easy to use, look great, and work fast. Get more customers with ease. No stress, no confusion — just simple, reliable solutions that help you grow.",
  },
};
