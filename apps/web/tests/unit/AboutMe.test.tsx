import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import AboutMe from "../../src/components/Footer/AboutMe";

describe("AboutMe", () => {
  it("renders About Us links and subtitle", () => {
    render(
      <MemoryRouter>
        <AboutMe />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole("link", { name: "About Us" })).toHaveLength(2);

    expect(screen.getByText("Who we are and what we do.")).toBeInTheDocument();
  });
});
