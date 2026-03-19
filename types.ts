
export enum SubscriptionType {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE'
}

export enum UserRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  SECURITY = 'SECURITY'
}

export type Language = 'ar' | 'en';

export interface UserPermission {
  canViewLive: boolean;
  canViewIncidents: boolean;
  canExportReports: boolean;
  canManageUsers: boolean;
  canEditSettings: boolean;
}

export interface StoreUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastActive: string;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface Suspect {
  id: string;
  box: BoundingBox;
  label: string;
  riskLevel: RiskLevel;
}

export interface DetectionResult {
  isTheft: boolean;
  confidence: number;
  reason: string;
  timestamp: string;
  screenshot?: string;
  riskLevel?: RiskLevel;
  markers?: string[];
  suspects?: Suspect[];
  suspectPhotos?: string[];
}

export interface PricingPlan {
  id: SubscriptionType;
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}
