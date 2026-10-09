describe("Jest unit testing foundation", () => {
  it("runs TypeScript unit tests dynamically", () => {
    const add = (a: number, b: number): number => a + b;
    const value = add(2, 2);

    expect(value).toBe(4);
  });

  it("supports isolated application logic", () => {
    const normalizeName = (name: string) => name.trim().toLowerCase();
    expect(normalizeName("  Build Me  ")).toBe("build me");
  });
});
