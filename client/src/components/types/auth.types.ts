// src/auth/types.ts

export type ProfessionType =
  | "engineer"
  | "scientist"
  | "researcher"
  | "student"
  | "professor"
  | "other";

export interface UserProfile {
  id: string;
  username: string;
  full_name: string | null;
  profession: ProfessionType;
  organization: string | null;
  department: string | null;
  bio: string | null;
  avatar_url: string | null;
  website_url: string | null;
  is_verified: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  user: UserProfile;
}

export interface SignupPayload {
  email: string;
  password: string;
  username: string;
  full_name: string;
  profession: ProfessionType;
  organization?: string;
  department?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ProfileUpdate {
  full_name?: string;
  profession?: ProfessionType;
  organization?: string;
  department?: string;
  bio?: string;
  avatar_url?: string;
  website_url?: string;
}

export interface ApiError {
  detail: string;
}

export interface UsernameCheckResponse {
  username: string;
  available: boolean;
}

// Profession display metadata (used in UI cards)
export interface ProfessionMeta {
  value: ProfessionType;
  label: string;
  description: string;
  icon: string; // lucide icon name
}

export const PROFESSIONS: ProfessionMeta[] = [
  {
    value: "engineer",
    label: "Engineer",
    description: "Building systems & deploying solutions",
    icon: "Cpu",
  },
  {
    value: "scientist",
    label: "Scientist",
    description: "Conducting experiments & discovering knowledge",
    icon: "FlaskConical",
  },
  {
    value: "researcher",
    label: "Researcher",
    description: "Bridging theory with applied investigation",
    icon: "Microscope",
  },
  {
    value: "student",
    label: "Student",
    description: "Learning and contributing at the frontier",
    icon: "GraduationCap",
  },
  {
    value: "professor",
    label: "Professor",
    description: "Educating and leading research teams",
    icon: "BookOpen",
  },
  {
    value: "other",
    label: "Other",
    description: "Another role in the knowledge ecosystem",
    icon: "Sparkles",
  },
];