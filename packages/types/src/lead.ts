export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source?: string;
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  createdAt: string;
  updatedAt: string;
}
