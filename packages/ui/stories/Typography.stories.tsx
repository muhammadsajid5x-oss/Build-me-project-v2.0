import type { Meta, StoryObj } from "@storybook/react-vite";
import { typography } from "../src/theme";

function TypographyScale() {
  return (
    <main style={{ display: "grid", gap: "2rem", padding: "2rem" }}>
      <section>
        <h1 style={typography.headings.h1}>Heading One</h1>
        <h2 style={typography.headings.h2}>Heading Two</h2>
        <h3 style={typography.headings.h3}>Heading Three</h3>
        <h4 style={typography.headings.h4}>Heading Four</h4>
        <h5 style={typography.headings.h5}>Heading Five</h5>
        <h6 style={typography.headings.h6}>Heading Six</h6>
      </section>

      <section>
        <p style={typography.body.large}>Large body text sample.</p>
        <p style={typography.body.default}>Default body text sample.</p>
        <p style={typography.body.small}>Small body text sample.</p>
      </section>

      <section style={{ display: "grid", gap: "0.5rem" }}>
        <div>
          <label
            htmlFor="typography-default-label"
            style={typography.label.default}
          >
            Default label
          </label>
          <input id="typography-default-label" />
        </div>
        <div>
          <label
            htmlFor="typography-small-label"
            style={typography.label.small}
          >
            Small label
          </label>
          <input id="typography-small-label" />
        </div>
        <span style={typography.caption}>Caption text</span>
      </section>
    </main>
  );
}

const meta = {
  title: "Foundations/Typography",
  component: TypographyScale,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof TypographyScale>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scale: Story = {};
