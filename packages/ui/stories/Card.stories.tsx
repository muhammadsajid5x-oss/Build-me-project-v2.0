import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Card, CardBody, CardFooter, CardHeader } from "../src/components/Card";
import { Loading } from "../src/components/Loading";

const meta = {
  title: "Components/Card",
  component: Card,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <strong>Example card</strong>
        </CardHeader>
        <CardBody>
          <p>A shared card built from Header, Body, and Footer sections.</p>
        </CardBody>
        <CardFooter>Updated today</CardFooter>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("article")).toBeVisible();
    await expect(canvas.getByText("Example card")).toBeVisible();
    await expect(
      canvas.getByText(
        "A shared card built from Header, Body, and Footer sections.",
      ),
    ).toBeVisible();
    await expect(canvas.getByText("Updated today")).toBeVisible();
  },
};

export const LoadingState: Story = {
  name: "Loading",
  args: {
    state: "loading",
    children: (
      <CardBody>
        <Loading label="Loading card content..." />
      </CardBody>
    ),
  },
};

export const Empty: Story = {
  args: {
    state: "empty",
    children: (
      <CardBody>
        <p>No items yet.</p>
      </CardBody>
    ),
  },
};

export const ErrorState: Story = {
  name: "Error",
  args: {
    state: "error",
    children: (
      <CardBody>
        <p role="alert">Unable to load this content.</p>
      </CardBody>
    ),
  },
};

export const Variations: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {(["small", "medium", "large"] as const).map((size) => (
        <Card key={size} size={size}>
          <CardHeader>
            <strong>{size[0].toUpperCase() + size.slice(1)} card</strong>
          </CardHeader>
          <CardBody>
            <p>Card size: {size}</p>
          </CardBody>
        </Card>
      ))}
    </div>
  ),
};
