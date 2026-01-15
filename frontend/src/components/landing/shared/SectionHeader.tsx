import React from "react";

interface SectionHeaderProps {
  title: string;
  highlight: string;
  description: string;
  badge?: string;
}

export function SectionHeader({
  title,
  highlight,
  description,
  badge,
}: SectionHeaderProps) {
  return (
    <div className="text-center mb-16">
      {badge && (
        <div className="inline-flex items-center px-5 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-4">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {badge}
        </div>
      )}

      <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight">
        {title}
        <span className="relative inline-block mx-3">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700">
            {highlight}
          </span>
          <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full opacity-30" />
        </span>
      </h2>

      <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
        {description}
      </p>
    </div>
  );
}
