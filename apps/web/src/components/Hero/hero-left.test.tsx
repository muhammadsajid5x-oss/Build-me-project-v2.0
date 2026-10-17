import { render, screen } from "@testing-library/react";
import HeroLeft from "./hero-left";

describe("HeroLeft", () => {
  it("renders the default hero content", () => {
    render(<HeroLeft />);

    expect(screen.getByText("TECHNOLOGY OWNERSHIP")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Build Better Digital Experiences",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Simple, fast, and beautiful platforms that win and get real results",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Websites and apps that are easy to use, look great, and work fast. Get more customers with ease. No stress, no confusion — just simple, reliable solutions that help you grow.",
      ),
    ).toBeInTheDocument();
  });

  it("renders custom hero content", () => {
    render(
      <HeroLeft
        badge="Custom Badge"
        titlePrimary="Build"
        titleSecondary="Better Products"
        subheading="Custom subheading"
        description="Custom description."
      />,
    );

    expect(screen.getByText("Custom Badge")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Build Better Products",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Custom subheading")).toBeInTheDocument();
    expect(screen.getByText("Custom description.")).toBeInTheDocument();
  });
});
