export class IntegrationError extends Error {
  constructor(
    message: string,
    public readonly code: string = "INTEGRATION_ERROR",
    public readonly status?: number,
  ) {
    super(message);
    this.name = "IntegrationError";
  }
}
