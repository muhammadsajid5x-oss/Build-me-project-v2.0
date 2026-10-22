import { render, screen } from "@testing-library/react";

import HeroRight from "../../src/components/Hero/hero-right";

declare const describe: (name: string, fn: () => void) => void;

declare const it: (name: string, fn: () => void) => void;

declare const expect: (actual: unknown) => {
  toBeInTheDocument(): void;
  toHaveAttribute(name: string, value: string): void;
};

describe("HeroRight", () => {
  it("renders the default impact heading", () => {
    render(<HeroRight />);

    expect(
      screen.getByRole("heading", { name: "My Impact in Action" }),
    ).toBeInTheDocument();
  });

  it("renders the technology owner image", () => {
    render(<HeroRight />);

    const image = screen.getByRole("img", {
      name: "Technology Owner working on a laptop",
    });

    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/Sajid.png");
  });

  it("renders all default impact metrics", () => {
    render(<HeroRight />);

    expect(screen.getByText("99.9%")).toBeInTheDocument();
    expect(screen.getByText("System Reliability")).toBeInTheDocument();

    expect(screen.getByText("Faster")).toBeInTheDocument();
    expect(screen.getByText("Time to Market")).toBeInTheDocument();

    expect(screen.getByText("Lower")).toBeInTheDocument();
    expect(screen.getByText("Operational Costs")).toBeInTheDocument();

    expect(screen.getByText("Stronger")).toBeInTheDocument();
    expect(screen.getByText("Security & Trust")).toBeInTheDocument();
  });

  it("renders the impact metrics container with the correct accessible label", () => {
    render(<HeroRight />);

    expect(
      screen.getByRole("complementary", {
        name: "Technology Owner Impact Metrics",
      }),
    ).toBeInTheDocument();
  });

  it("renders a custom image", () => {
    render(<HeroRight imageSrc="/custom-person.png" />);

    expect(
      screen.getByRole("img", {
        name: "Technology Owner working on a laptop",
      }),
    ).toHaveAttribute("src", "/custom-person.png");
  });

  it("renders a custom annotation title", () => {
    render(<HeroRight titleAnnotation="Technology Impact" />);

    expect(
      screen.getByRole("heading", {
        name: "Technology Impact",
      }),
    ).toBeInTheDocument();
  });

  it("renders custom metrics", () => {
    render(
      <HeroRight
        metrics={[
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
        ]}
      />,
    );

    expect(screen.getByText("99.9%")).toBeInTheDocument();
    expect(screen.getByText("Delivery Speed")).toBeInTheDocument();
    expect(screen.getByText("Operational Costs")).toBeInTheDocument();
    expect(screen.getByText("Security & Trust")).toBeInTheDocument();
  });
});
