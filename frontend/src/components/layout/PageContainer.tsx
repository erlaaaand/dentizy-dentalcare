'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Breadcrumb, Button, Card, LoadingSpinner } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/core';
import { cn } from '@/core';

// ============================================
// TYPES
// ============================================

export interface PageAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
}

export interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumb?: {
    items: Array<{
      label: string;
      href?: string;
      active?: boolean;
    }>;
  };
  actions?: PageAction[];
  headerAction?: React.ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  loading?: boolean;
  className?: string;
  contentClassName?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  showHeader?: boolean;
}

// ============================================
// STYLE CONFIGURATION
// ============================================

const maxWidthClasses = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

const paddingClasses = {
  none: 'px-0 py-0',
  sm: 'px-4 py-4 sm:px-6',
  md: 'px-6 py-6',
  lg: 'px-8 py-8',
};

// ============================================
// AUTO BREADCRUMB GENERATOR
// ============================================

const generateBreadcrumbFromPath = (pathname: string) => {
  const paths = pathname.split('/').filter(Boolean);

  const breadcrumbItems = paths.map((path, index) => {
    const href = '/' + paths.slice(0, index + 1).join('/');
    const isLast = index === paths.length - 1;

    const label = path
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return {
      label,
      href: isLast ? undefined : href,
      active: isLast,
    };
  });

  if (paths.length > 0) {
    breadcrumbItems.unshift({
      label: 'Dashboard',
      href: ROUTES.DASHBOARD,
      active: false,
    });
  }

  return breadcrumbItems;
};

const getPageTitleFromPath = (pathname: string): string => {
  const paths = pathname.split('/').filter(Boolean);
  const lastPath = paths[paths.length - 1];

  if (!lastPath) return 'Dashboard';

  if (lastPath.startsWith('[') && lastPath.endsWith(']')) {
    const parentPath = paths[paths.length - 2];
    return parentPath
      ? parentPath.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      : 'Detail';
  }

  return lastPath
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// ============================================
// MAIN COMPONENT
// ============================================

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  subtitle,
  breadcrumb,
  actions = [],
  headerAction,
  showBackButton = false,
  onBack,
  loading = false,
  className = '',
  contentClassName = '',
  maxWidth = 'xl',
  padding = 'md',
  showHeader = true,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const pageTitle = title || getPageTitleFromPath(pathname);
  const breadcrumbItems = breadcrumb?.items || generateBreadcrumbFromPath(pathname);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      <div className={cn('mx-auto', maxWidthClasses[maxWidth], paddingClasses[padding])}>

        {showHeader && (
          <div className="mb-6 space-y-4">

            {(showBackButton || onBack) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                icon={<ArrowLeft className="h-4 w-4" />}
              >
                Kembali
              </Button>
            )}

            {breadcrumbItems.length > 0 && (
              <div className="flex items-center justify-between">
                <Breadcrumb items={breadcrumbItems} />
                {headerAction && (
                  <div className="flex-shrink-0">
                    {headerAction}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
                  {pageTitle}
                </h1>
                {subtitle && (
                  <p className="mt-1 text-sm text-gray-500 sm:mt-2">
                    {subtitle}
                  </p>
                )}
              </div>

              {actions.length > 0 && (
                <div className="flex flex-shrink-0 space-x-3">
                  {actions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant || 'primary'}
                      size={action.size || 'md'}
                      onClick={action.onClick}
                      loading={action.loading}
                      disabled={action.disabled}
                      icon={action.icon}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {loading && (
          <Card className="mb-6">
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" showText text="Memuat data..." />
            </div>
          </Card>
        )}

        <div className={contentClassName}>
          {!loading && children}
        </div>
      </div>
    </div>
  );
};

export default PageContainer;