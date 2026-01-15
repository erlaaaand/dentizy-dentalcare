// frontend/src/types/landing.types.ts
export interface NavLink {
  name: string;
  href: string;
}

export interface DoctorInfo {
  name: string;
  title: string;
  image: string;
}

export interface ServiceInfo {
  title: string;
  desc: string;
  price: string;
  badge: string;
  features: string[];
  image: string;
}

export interface FeatureInfo {
  title: string;
  desc: string;
  badge: string;
  features: string[];
}

export interface StatInfo {
  value: string;
  label: string;
}
