import { ReactNode } from 'react';

// Layout Types
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