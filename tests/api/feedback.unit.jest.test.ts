/**
 * @jest-environment node
 */

import { validateCreateFeedback } from "../../services/api/src/validators/feedback.js";

describe("Feedback validator", () => {
  it("accepts a valid Score Us submission", () => {
    const result = validateCreateFeedback({
      type: "score",
      name: "Muhammad Sajid",
      email: "sajid@example.com",
      score: 9,
      content: "The platform is very useful and easy to understand.",
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      throw new Error("Expected valid feedback input.");
    }

    expect(result.data).toEqual({
      type: "score",
      name: "Muhammad Sajid",
      email: "sajid@example.com",
      score: 9,
      content: "The platform is very useful and easy to understand.",
    });
  });

  it("rejects an invalid score", () => {
    const result = validateCreateFeedback({
      type: "score",
      name: "Muhammad Sajid",
      email: "sajid@example.com",
      score: 11,
      content: "Test feedback",
    });

    expect(result.success).toBe(false);
  });
});
