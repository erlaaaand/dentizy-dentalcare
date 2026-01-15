// frontend/src/core/types/global/layout.types.ts
import { ReactNode } from 'react';

export interface LayoutConfig {
  title?: string;
  description?: string;
  showHeader?: boolean;
  showSidebar?: boolean;
  showFooter?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode;
  children?: NavItem[];
  roles?: string[];
}

export interface SidebarConfig {
  items: NavItem[];
  collapsed?: boolean;
}