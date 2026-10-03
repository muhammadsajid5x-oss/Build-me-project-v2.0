export interface Project {
  id: string;
  name: string;
  description?: string;
  status: "draft" | "active" | "completed" | "archived";
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}
