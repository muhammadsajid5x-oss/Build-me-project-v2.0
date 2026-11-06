import request from "supertest";
import app from "../../../services/api/src/app.js";

jest.mock("../../../services/api/src/services/testimonials.js", () => ({
  listPublishedTestimonials: jest.fn(),
  incrementTestimonialHelpfulCount: jest.fn(),
}));

const {
  listPublishedTestimonials: mockListPublishedTestimonials,
  incrementTestimonialHelpfulCount: mockIncrementTestimonialHelpfulCount,
} = jest.requireMock("../../../services/api/src/services/testimonials.js") as {
  listPublishedTestimonials: jest.Mock;
  incrementTestimonialHelpfulCount: jest.Mock;
};

const path = "/api/v1/testimonials";

const pageOneResponse = {
  data: [
    {
      id: "testimonial-1",
      name: "Ayesha Khan",
      role: "Product Manager",
      company: "Tech Company",
      avatar: null,
      category: "Technology",
      content: "Excellent collaboration and strong technical delivery.",
      rating: 5,
      helpfulCount: 3,
      storyUrl: null,
      verified: true,
      published: true,
      createdAt: "2026-10-01T00:00:00.000Z",
    },
    {
      id: "testimonial-2",
      name: "Bilal Ahmed",
      role: "Founder",
      company: "Startup",
      avatar: null,
      category: "Technology",
      content: "Professional, reliable, and technically strong.",
      rating: 5,
      helpfulCount: 2,
      storyUrl: null,
      verified: true,
      published: true,
      createdAt: "2026-10-02T00:00:00.000Z",
    },
  ],
  pagination: {
    page: 1,
    limit: 4,
    total: 6,
    totalPages: 2,
  },
};

describe("GET /api/v1/testimonials", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns published testimonials with the default pagination", async () => {
    mockListPublishedTestimonials.mockResolvedValue(pageOneResponse);

    const response = await request(app).get(path);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(pageOneResponse);
    expect(mockListPublishedTestimonials).toHaveBeenCalledWith(1, 4);
  });

  it("passes the requested page and limit to the testimonial service", async () => {
    const pageTwoResponse = {
      ...pageOneResponse,
      pagination: {
        ...pageOneResponse.pagination,
        page: 2,
      },
    };

    mockListPublishedTestimonials.mockResolvedValue(pageTwoResponse);

    const response = await request(app).get(path).query({
      page: 2,
      limit: 4,
    });

    expect(response.status).toBe(200);
    expect(response.body.pagination.page).toBe(2);
    expect(mockListPublishedTestimonials).toHaveBeenCalledWith(2, 4);
  });

  it("returns the testimonial collection and pagination metadata", async () => {
    mockListPublishedTestimonials.mockResolvedValue(pageOneResponse);

    const response = await request(app).get(path);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.pagination).toEqual({
      page: 1,
      limit: 4,
      total: 6,
      totalPages: 2,
    });
  });
});

describe("POST /api/v1/testimonials/:id/helpful", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("increments the helpful count for a published testimonial", async () => {
    mockIncrementTestimonialHelpfulCount.mockResolvedValue(4);

    const response = await request(app).post(`${path}/testimonial-1/helpful`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: {
        testimonialId: "testimonial-1",
        helpfulCount: 4,
      },
    });
    expect(mockIncrementTestimonialHelpfulCount).toHaveBeenCalledWith(
      "testimonial-1",
    );
  });

  it("returns 404 when the published testimonial does not exist", async () => {
    mockIncrementTestimonialHelpfulCount.mockResolvedValue(null);

    const response = await request(app).post(
      `${path}/missing-testimonial/helpful`,
    );

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Published testimonial not found.",
      },
    });
  });
});
