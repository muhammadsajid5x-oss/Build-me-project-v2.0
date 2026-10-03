export interface ApiRequest<T = unknown> {
  data: T;
}
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
