import { isUnauthorizedError } from "@build-me/utils";

import { apiClient } from "./apiClient";

export type DeliveryProjectRequest = {
  id: string;
  name: string;
  email: string;
  projectDescription: string;
  expectedOutcome: string;
  timeline?: string;
  budget?: string;
  status: string;
  createdAt: string;
};

export type MentorMeRequest = {
  id: string;
  name: string;
  email: string;
  mentoringArea: string;
  helpWith: string;
  experienceContext: string;
  preferredFormat?: string;
  availability?: string;
  status: string;
  createdAt: string;
};

export type CoffeeWithMeRequest = {
  id: string;
  name: string;
  email: string;
  topic: string;
  preferredFormat?: string;
  availability?: string;
  status: string;
  createdAt: string;
};

export type OwnershipAuditOption = "A" | "B" | "C";

export type OwnershipAuditAnswers = {
  q1: OwnershipAuditOption;
  q2: OwnershipAuditOption;
  q3: OwnershipAuditOption;
  q4: OwnershipAuditOption;
  q5: OwnershipAuditOption;
  q6: OwnershipAuditOption;
  q7: OwnershipAuditOption;
  q8: OwnershipAuditOption;
  q9: OwnershipAuditOption;
  q10: OwnershipAuditOption;
};

export type OwnershipAuditRequest = {
  id: string;
  fullName: string;
  visitorEmail: string | null;
  answers: OwnershipAuditAnswers | null;
  score: number;
  category: string;
  createdAt: string;
  legacy?: boolean;
  legacySteps?: {
    step1: string;
    step2: string;
    step3: string;
  };
};

export type OwnershipToolkitAccess = {
  id: string;
  fullName: string;
  visitorEmail: string;
  createdAt: string;
};

export type OwnershipLearningCircleRequest = {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
};

type DeliveryProjectRequestsResponse = {
  data: DeliveryProjectRequest[];
};

type MentorMeRequestsResponse = {
  data: MentorMeRequest[];
};

type CoffeeWithMeRequestsResponse = {
  data: CoffeeWithMeRequest[];
};

type OwnershipAuditRequestsResponse = {
  data: OwnershipAuditRequest[];
};

type OwnershipToolkitAccessesResponse = {
  data: OwnershipToolkitAccess[];
};

type OwnershipLearningCircleRequestsResponse = {
  data: OwnershipLearningCircleRequest[];
};

const deliveryLoadErrorMessage =
  "Delivery project requests could not be loaded. Please try again.";

const mentorLoadErrorMessage =
  "Mentor Me requests could not be loaded. Please try again.";

const coffeeLoadErrorMessage =
  "Coffee With Me requests could not be loaded. Please try again.";

const ownershipAuditLoadErrorMessage =
  "Ownership Audit requests could not be loaded. Please try again.";

const ownershipToolkitLoadErrorMessage =
  "Ownership Toolkit access records could not be loaded. Please try again.";

const ownershipLearningCircleLoadErrorMessage =
  "Ownership Learning Circle requests could not be loaded. Please try again.";

const unauthorizedMessage = "You are not authorised to view requests.";

export function formatCreatedAt(value: string): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export async function fetchDeliveryProjectRequests(): Promise<{
  data: DeliveryProjectRequest[];
  error: string | null;
}> {
  try {
    const response = await apiClient.get<DeliveryProjectRequestsResponse>(
      "api/v1/delivery-project-requests",
    );

    return {
      data: Array.isArray(response?.data) ? response.data : [],
      error: null,
    };
  } catch (error) {
    return {
      data: [],
      error: isUnauthorizedError(error)
        ? unauthorizedMessage
        : deliveryLoadErrorMessage,
    };
  }
}

export async function fetchMentorMeRequests(): Promise<{
  data: MentorMeRequest[];
  error: string | null;
}> {
  try {
    const response = await apiClient.get<MentorMeRequestsResponse>(
      "api/v1/mentor-me-requests",
    );

    return {
      data: Array.isArray(response?.data) ? response.data : [],
      error: null,
    };
  } catch (error) {
    return {
      data: [],
      error: isUnauthorizedError(error)
        ? unauthorizedMessage
        : mentorLoadErrorMessage,
    };
  }
}

export async function fetchCoffeeWithMeRequests(): Promise<{
  data: CoffeeWithMeRequest[];
  error: string | null;
}> {
  try {
    const response = await apiClient.get<CoffeeWithMeRequestsResponse>(
      "api/v1/coffee-with-me-requests",
    );

    return {
      data: Array.isArray(response?.data) ? response.data : [],
      error: null,
    };
  } catch (error) {
    return {
      data: [],
      error: isUnauthorizedError(error)
        ? unauthorizedMessage
        : coffeeLoadErrorMessage,
    };
  }
}

export async function fetchOwnershipAuditRequests(): Promise<{
  data: OwnershipAuditRequest[];
  error: string | null;
}> {
  try {
    const response = await apiClient.get<OwnershipAuditRequestsResponse>(
      "api/v1/ownership-audits",
    );

    return {
      data: Array.isArray(response?.data) ? response.data : [],
      error: null,
    };
  } catch (error) {
    return {
      data: [],
      error: isUnauthorizedError(error)
        ? unauthorizedMessage
        : ownershipAuditLoadErrorMessage,
    };
  }
}

export async function fetchOwnershipToolkitAccesses(): Promise<{
  data: OwnershipToolkitAccess[];
  error: string | null;
}> {
  try {
    const response = await apiClient.get<OwnershipToolkitAccessesResponse>(
      "api/v1/ownership-toolkit-accesses",
    );

    return {
      data: Array.isArray(response?.data) ? response.data : [],
      error: null,
    };
  } catch (error) {
    return {
      data: [],
      error: isUnauthorizedError(error)
        ? unauthorizedMessage
        : ownershipToolkitLoadErrorMessage,
    };
  }
}

export async function fetchOwnershipLearningCircleRequests(): Promise<{
  data: OwnershipLearningCircleRequest[];
  error: string | null;
}> {
  try {
    const response =
      await apiClient.get<OwnershipLearningCircleRequestsResponse>(
        "api/v1/ownership-learning-circle-requests",
      );

    return {
      data: Array.isArray(response?.data) ? response.data : [],
      error: null,
    };
  } catch (error) {
    return {
      data: [],
      error: isUnauthorizedError(error)
        ? unauthorizedMessage
        : ownershipLearningCircleLoadErrorMessage,
    };
  }
}

export async function fetchAllRequests(): Promise<{
  deliveryRequests: DeliveryProjectRequest[];
  mentorRequests: MentorMeRequest[];
  coffeeRequests: CoffeeWithMeRequest[];
  error: string | null;
}> {
  try {
    const [deliveryResponse, mentorResponse, coffeeResponse] =
      await Promise.all([
        apiClient.get<DeliveryProjectRequestsResponse>(
          "api/v1/delivery-project-requests",
        ),
        apiClient.get<MentorMeRequestsResponse>("api/v1/mentor-me-requests"),
        apiClient.get<CoffeeWithMeRequestsResponse>(
          "api/v1/coffee-with-me-requests",
        ),
      ]);

    return {
      deliveryRequests: Array.isArray(deliveryResponse?.data)
        ? deliveryResponse.data
        : [],
      mentorRequests: Array.isArray(mentorResponse?.data)
        ? mentorResponse.data
        : [],
      coffeeRequests: Array.isArray(coffeeResponse?.data)
        ? coffeeResponse.data
        : [],
      error: null,
    };
  } catch (error) {
    return {
      deliveryRequests: [],
      mentorRequests: [],
      coffeeRequests: [],
      error: isUnauthorizedError(error)
        ? unauthorizedMessage
        : "Requests could not be loaded. Please try again.",
    };
  }
}
