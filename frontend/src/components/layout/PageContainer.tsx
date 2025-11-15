// components/layout/PageContainer.tsx
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Breadcrumb, Button, Card } from '@/components/ui';
import { ArrowLeft, Plus, RefreshCw, Download, Filter } from 'lucide-react';

// ============================================
// TYPES
// ============================================

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
  actions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
  }>;
  headerAction?: React.ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  onRefresh?: () => void;
  loading?: boolean;
  className?: string;
  contentClassName?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  showHeader?: boolean;
}

// ============================================
// AUTO BREADCRUMB GENERATOR
// ============================================

const generateBreadcrumbFromPath = (pathname: string) => {
  const paths = pathname.split('/').filter(Boolean);

  const breadcrumbItems = paths.map((path, index) => {
    const href = '/' + paths.slice(0, index + 1).join('/');
    const isLast = index === paths.length - 1;

    // Format label from path
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

  // Add home as first item
  if (paths.length > 0) {
    breadcrumbItems.unshift({
      label: 'Dashboard',
      href: '/dashboard',
      active: false,
    });
  }

  return breadcrumbItems;
};

const getPageTitleFromPath = (pathname: string): string => {
  const paths = pathname.split('/').filter(Boolean);
  const lastPath = paths[paths.length - 1];

  if (!lastPath) return 'Dashboard';

  // Handle dynamic routes like [id]
  if (lastPath.startsWith('[') && lastPath.endsWith(']')) {
    const parentPath = paths[paths.length - 2];
    return parentPath
      ? parentPath.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      : 'Detail';
  }

  // Format title from path
  return lastPath
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// ============================================
// DEFAULT ACTIONS
// ============================================

const defaultActions = {
  refresh: (onRefresh?: () => void, loading?: boolean) => ({
    label: 'Refresh',
    icon: <RefreshCw className="h-4 w-4" />,
    onClick: () => onRefresh?.(),
    variant: 'outline' as const,
    loading,
  }),
  create: (onCreate?: () => void) => ({
    label: 'Tambah Baru',
    icon: <Plus className="h-4 w-4" />,
    onClick: () => onCreate?.(),
    variant: 'primary' as const,
  }),
  export: (onExport?: () => void) => ({
    label: 'Export',
    icon: <Download className="h-4 w-4" />,
    onClick: () => onExport?.(),
    variant: 'outline' as const,
  }),
  filter: (onFilter?: () => void) => ({
    label: 'Filter',
    icon: <Filter className="h-4 w-4" />,
    onClick: () => onFilter?.(),
    variant: 'outline' as const,
  }),
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
  onRefresh,
  loading = false,
  className = '',
  contentClassName = '',
  maxWidth = 'xl',
  padding = 'md',
  showHeader = true,
}) => {
  const pathname = usePathname();

  // Auto-generate title and breadcrumb if not provided
  const pageTitle = title || getPageTitleFromPath(pathname);
  const breadcrumbItems = breadcrumb?.items || generateBreadcrumbFromPath(pathname);

  // Add refresh action if onRefresh provided and not already in actions
  const allActions = [...actions];
  if (onRefresh && !actions.find(action => action.label === 'Refresh')) {
    allActions.unshift(defaultActions.refresh(onRefresh, loading));
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

  const contentPaddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Main Content Container */}
      <div className={`mx-auto ${maxWidthClasses[maxWidth]} ${paddingClasses[padding]}`}>

        {/* Header Section */}
        {showHeader && (
          <div className="mb-6 space-y-4">

            {/* Back Button */}
            {(showBackButton || onBack) && (
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBack}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Kembali</span>
                </Button>
              </div>
            )}

            {/* Breadcrumb */}
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

            {/* Title and Actions */}
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

              {/* Action Buttons */}
              {allActions.length > 0 && (
                <div className="flex flex-shrink-0 space-x-3">
                  {allActions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant || 'primary'}
                      size={action.size || 'md'}
                      onClick={action.onClick}
                      loading={action.loading}
                      disabled={action.disabled}
                      className="flex items-center space-x-2"
                    >
                      {action.icon}
                      <span>{action.label}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="mb-6">
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Memuat data...</p>
              </div>
            </div>
          </Card>
        )}

        {/* Content Area */}
        <div className={contentClassName}>
          {!loading && children}
        </div>
      </div>
    </div>
  );
};

// ============================================
// SPECIALIZED PAGE CONTAINERS
// ============================================

// For List Pages
interface ListPageContainerProps extends Omit<PageContainerProps, 'actions'> {
  onAdd?: () => void;
  onExport?: () => void;
  onFilter?: () => void;
  addButtonLabel?: string;
  showCreateButton?: boolean;
  showExportButton?: boolean;
  showFilterButton?: boolean;
}

export const ListPageContainer: React.FC<ListPageContainerProps> = ({
  onAdd,
  onExport,
  onFilter,
  addButtonLabel = 'Tambah Baru',
  showCreateButton = true,
  showExportButton = false,
  showFilterButton = false,
  ...props
}) => {
  const actions: PageContainerProps['actions'] = [];

  if (showFilterButton && onFilter) {
    actions.push(defaultActions.filter(onFilter));
  }

  if (showExportButton && onExport) {
    actions.push(defaultActions.export(onExport));
  }

  if (showCreateButton && onAdd) {
    actions.push({
      label: addButtonLabel,
      icon: <Plus className="h-4 w-4" />,
      onClick: onAdd,
      variant: 'primary',
    });
  }

  return (
    <PageContainer
      {...props}
      actions={actions}
    />
  );
};

// For Detail Pages
interface DetailPageContainerProps extends PageContainerProps {
  onEdit?: () => void;
  onDelete?: () => void;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
  editButtonLabel?: string;
  deleteButtonLabel?: string;
}

export const DetailPageContainer: React.FC<DetailPageContainerProps> = ({
  onEdit,
  onDelete,
  showEditButton = true,
  showDeleteButton = true,
  editButtonLabel = 'Edit',
  deleteButtonLabel = 'Hapus',
  showBackButton = true,
  ...props
}) => {
  const actions: PageContainerProps['actions'] = [];

  if (showEditButton && onEdit) {
    actions.push({
      label: editButtonLabel,
      icon: <Plus className="h-4 w-4" />,
      onClick: onEdit,
      variant: 'outline',
    });
  }

  if (showDeleteButton && onDelete) {
    actions.push({
      label: deleteButtonLabel,
      onClick: onDelete,
      variant: 'danger',
    });
  }

  return (
    <PageContainer
      {...props}
      showBackButton={showBackButton}
      actions={actions}
    />
  );
};

// For Form Pages
interface FormPageContainerProps extends PageContainerProps {
  onSubmit?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  submitLoading?: boolean;
  showSubmitButton?: boolean;
  showCancelButton?: boolean;
}

export const FormPageContainer: React.FC<FormPageContainerProps> = ({
  onSubmit,
  onCancel,
  submitLabel = 'Simpan',
  cancelLabel = 'Batal',
  submitLoading = false,
  showSubmitButton = true,
  showCancelButton = true,
  showBackButton = true,
  ...props
}) => {
  const actions: PageContainerProps['actions'] = [];

  if (showCancelButton && onCancel) {
    actions.push({
      label: cancelLabel,
      onClick: onCancel,
      variant: 'outline',
    });
  }

  if (showSubmitButton && onSubmit) {
    actions.push({
      label: submitLabel,
      onClick: onSubmit,
      variant: 'primary',
      loading: submitLoading,
    });
  }

  return (
    <PageContainer
      {...props}
      showBackButton={showBackButton}
      actions={actions}
    />
  );
};

export default PageContainer;