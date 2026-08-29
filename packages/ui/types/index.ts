export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

export interface User {
  id: string;
  fullName?: string | null;
  email: string;
  profileImageUrl?: string | null;
  plan: string;
  credits: number;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt?: string | null;
}
