import { apiClient } from "./apiClient";
import { isUnauthorizedError } from "@build-me/utils";

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

type DeliveryProjectRequestsResponse = {
  data: DeliveryProjectRequest[];
};

type MentorMeRequestsResponse = {
  data: MentorMeRequest[];
};

const deliveryLoadErrorMessage =
  "Delivery project requests could not be loaded. Please try again.";

const mentorLoadErrorMessage =
  "Mentor Me requests could not be loaded. Please try again.";

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

export async function fetchAllRequests(): Promise<{
  deliveryRequests: DeliveryProjectRequest[];
  mentorRequests: MentorMeRequest[];
  error: string | null;
}> {
  try {
    const [deliveryResponse, mentorResponse] = await Promise.all([
      apiClient.get<DeliveryProjectRequestsResponse>(
        "api/v1/delivery-project-requests",
      ),
      apiClient.get<MentorMeRequestsResponse>("api/v1/mentor-me-requests"),
    ]);

    return {
      deliveryRequests: Array.isArray(deliveryResponse?.data)
        ? deliveryResponse.data
        : [],
      mentorRequests: Array.isArray(mentorResponse?.data)
        ? mentorResponse.data
        : [],
      error: null,
    };
  } catch (error) {
    return {
      deliveryRequests: [],
      mentorRequests: [],
      error: isUnauthorizedError(error)
        ? unauthorizedMessage
        : "Requests could not be loaded. Please try again.",
    };
  }
}