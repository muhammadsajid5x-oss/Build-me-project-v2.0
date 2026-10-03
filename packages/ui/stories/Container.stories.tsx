import type { Meta, StoryObj } from "@storybook/react-vite";
import { Container, Section } from "../src/components/Layout";

const meta = {
  title: "Components/Container",
  component: Container,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <Section>
        <h1>Build Me</h1>
        <p>A shared responsive page container.</p>
      </Section>
    ),
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1rem", padding: "1rem" }}>
      {(["sm", "md", "lg", "xl", "2xl"] as const).map((size) => (
        <Container key={size} size={size}>
          <Section spacing="sm">
            <div
              style={{
                border: "1px solid #d1d5db",
                padding: "0.5rem",
                overflowWrap: "anywhere",
              }}
            >
              Container {size}
            </div>
          </Section>
        </Container>
      ))}
    </div>
  ),
};
