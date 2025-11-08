'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ReportCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  trend?: {
    value: number;
    label: string;
  };
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    trendUp: 'text-blue-600',
    trendDown: 'text-blue-600',
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
    trendUp: 'text-green-600',
    trendDown: 'text-red-600',
  },
  yellow: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-600',
    trendUp: 'text-yellow-600',
    trendDown: 'text-yellow-600',
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-600',
    trendUp: 'text-red-600',
    trendDown: 'text-green-600',
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
    trendUp: 'text-purple-600',
    trendDown: 'text-purple-600',
  },
  indigo: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-600',
    trendUp: 'text-indigo-600',
    trendDown: 'text-indigo-600',
  },
};

export function ReportCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
}: ReportCardProps) {
  const colors = colorClasses[color];
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`text-sm font-medium ${
                  trend.value >= 0 ? colors.trendUp : colors.trendDown
                }`}
              >
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-sm text-gray-500">{trend.label}</span>
            </div>
          )}
        </div>
        
        <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
      </div>
    </div>
  );
}