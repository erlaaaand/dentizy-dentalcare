// components/ui/data-display/Skeleton.tsx
import React from 'react';
import { cn } from '@/core/utils';
import { SkeletonProps } from './skeleton.types';
import { colorClasses, speedClasses, variantClasses } from './skeleton.styles';
import { SkeletonGroup } from './SkeletonGroup';
import { SkeletonCard } from './SkeletonCard';
import { SkeletonAvatar } from './SkeletonAvatar';
import { SkeletonText } from './SkeletonText';
import { SkeletonTable } from './SkeletonTable';
import { SkeletonProfile } from './SkeletonProfile';
import { SkeletonForm } from './SkeletonForm';
import { SkeletonStats } from './SkeletonStats';

export default function Skeleton({
  variant = 'text',
  width,
  height,
  className,
  animated = true,
  speed = 'normal',
  color = 'default',
  shimmer = false,
}: SkeletonProps) {
  const baseClasses = cn(
    'inline-block',
    colorClasses[color],
    animated && speedClasses[speed],
    shimmer && 'relative overflow-hidden'
  );

  const style: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'circular' ? width : undefined),
  };

  const skeletonContent = (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  );

  if (shimmer) {
    return (
      <div className="relative overflow-hidden">
        {skeletonContent}
        <div
          className={cn(
            'absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent',
            variantClasses[variant]
          )}
        />
      </div>
    );
  }

  return skeletonContent;
}

Skeleton.Group = SkeletonGroup;
Skeleton.Card = SkeletonCard;
Skeleton.Avatar = SkeletonAvatar;
Skeleton.Text = SkeletonText;
Skeleton.Table = SkeletonTable;
Skeleton.Profile = SkeletonProfile;
Skeleton.Form = SkeletonForm;
Skeleton.Stats = SkeletonStats;