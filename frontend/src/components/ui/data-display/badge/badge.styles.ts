export const badgeVariants = {
  // Solid variants
  default: 'bg-gray-100 text-gray-900 border-gray-200 hover:bg-gray-200',
  primary: 'bg-blue-100 text-blue-900 border-blue-200 hover:bg-blue-200',
  success: 'bg-green-100 text-green-900 border-green-200 hover:bg-green-200',
  error: 'bg-red-100 text-red-900 border-red-200 hover:bg-red-200',
  warning: 'bg-yellow-100 text-yellow-900 border-yellow-200 hover:bg-yellow-200',
  info: 'bg-cyan-100 text-cyan-900 border-cyan-200 hover:bg-cyan-200',
  secondary: 'bg-purple-100 text-purple-900 border-purple-200 hover:bg-purple-200',

  // Outline variants
  outline: 'bg-transparent text-gray-700 border-gray-300 hover:bg-gray-50',

  // Ghost variants
  ghost: 'bg-transparent text-gray-600 border-transparent hover:bg-gray-100 hover:text-gray-700',
};

export const gradientVariants: Record<string, string> = {
  default: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-transparent',
  primary: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-transparent',
  success: 'bg-gradient-to-r from-green-500 to-green-600 text-white border-transparent',
  error: 'bg-gradient-to-r from-red-500 to-red-600 text-white border-transparent',
  warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-transparent',
  info: 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white border-transparent',
  secondary: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-transparent',
  outline: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-transparent',
  ghost: 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 border-transparent',
};

export const sizeClasses = {
  xs: 'px-2 py-0.5 text-xs min-h-[20px]',
  sm: 'px-2.5 py-0.5 text-xs min-h-[24px]',
  md: 'px-3 py-1 text-sm min-h-[28px]',
  lg: 'px-3.5 py-1.5 text-sm min-h-[32px]',
};

export const shapeClasses = {
  rounded: 'rounded-md',
  square: 'rounded-none',
  pill: 'rounded-full',
};

export const iconSizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-4 h-4',
};

export const dotColors: Record<string, string> = {
  default: 'bg-gray-500',
  primary: 'bg-blue-500',
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-yellow-500',
  info: 'bg-cyan-500',
  secondary: 'bg-purple-500',
  outline: 'bg-gray-400',
  ghost: 'bg-gray-400',
};