import { NextPage } from 'next';
import { ReactElement, ReactNode } from 'react';

// Next.js specific types
export type NextPageWithLayout<P = object> = NextPage<P> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export interface LayoutProps {
  children: ReactNode;
}

export interface PageProps {
  params?: Record<string, string>;
  searchParams?: Record<string, string>;
}