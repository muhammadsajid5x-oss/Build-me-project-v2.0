import { isUnauthorizedError } from "@build-me/utils";

import { apiClient } from "./apiClient";

export type Booking = {
  id: string;
  leadId: string;
  planId: string;
  service: string;
  planName: string;
  price: number;
  currency: string;
  billingPeriod: string;
  status: "pending_payment" | "paid" | "cancelled";
  createdAt: string;
};

type BookingsResponse = {
  data: Booking[];
};

const loadErrorMessage = "Bookings could not be loaded. Please try again.";

const unauthorizedMessage = "You are not authorised to view bookings.";

export async function fetchBookings(): Promise<{
  data: Booking[];
  error: string | null;
}> {
  try {
    const response = await apiClient.get<BookingsResponse>("api/v1/bookings");

    return {
      data: Array.isArray(response?.data) ? response.data : [],
      error: null,
    };
  } catch (error) {
    return {
      data: [],
      error: isUnauthorizedError(error)
        ? unauthorizedMessage
        : loadErrorMessage,
    };
  }
}
