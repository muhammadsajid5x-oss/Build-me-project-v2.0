import { isUnauthorizedError } from "@build-me/utils";

import { apiClient } from "./apiClient";

export type Invoice = {
  id: string;
  bookingId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "void";
  issuedAt: string;
  dueAt: string | null;
  paidAt: string | null;
};

type InvoicesResponse = {
  data: Invoice[];
};

const loadErrorMessage = "Invoices could not be loaded. Please try again.";

const unauthorizedMessage = "You are not authorised to view invoices.";

export async function fetchInvoices(): Promise<{
  data: Invoice[];
  error: string | null;
}> {
  try {
    const response = await apiClient.get<InvoicesResponse>("api/v1/invoices");

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
