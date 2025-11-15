export const baseClasses = `
  inline-flex 
  items-center 
  justify-center 
  font-medium 
  transition-all 
  duration-200 
  ease-in-out 
  focus:outline-none 
  focus:ring-2 
  focus:ring-offset-2 
  disabled:opacity-60 
  disabled:cursor-not-allowed 
  disabled:pointer-events-none
  active:scale-95
  transform
  relative
  overflow-hidden
  group
`;

export const sizeClasses = {
    xs: `
    px-2.5 
    py-1.5 
    text-xs 
    gap-1.5
    min-h-[28px]
  `,
    sm: `
    px-3 
    py-2 
    text-sm 
    gap-2
    min-h-[36px]
  `,
    md: `
    px-4 
    py-2.5 
    text-sm 
    gap-2
    min-h-[42px]
  `,
    lg: `
    px-5 
    py-3 
    text-base 
    gap-2.5
    min-h-[48px]
  `,
    xl: `
    px-6 
    py-3.5 
    text-base 
    gap-3
    min-h-[52px]
  `,
};

export const variantClasses = {
    // Primary - Modern blue gradient
    primary: `
    bg-gradient-to-r 
    from-blue-600 
    to-blue-700 
    text-white 
    hover:from-blue-700 
    hover:to-blue-800 
    focus:ring-blue-500 
    focus:ring-offset-white 
    shadow-md 
    hover:shadow-lg 
    border 
    border-blue-600 
    hover:border-blue-700
    after:content-[''] 
    after:absolute 
    after:inset-0 
    after:bg-gradient-to-r 
    after:from-white 
    after:to-transparent 
    after:opacity-0 
    after:transition-opacity 
    after:duration-200 
    hover:after:opacity-10
  `,

    // Secondary - Modern gray
    secondary: `
    bg-gray-100 
    text-gray-900 
    hover:bg-gray-200 
    focus:ring-gray-500 
    focus:ring-offset-white 
    border 
    border-gray-200 
    hover:border-gray-300 
    shadow-sm 
    hover:shadow-md
    after:content-[''] 
    after:absolute 
    after:inset-0 
    after:bg-white 
    after:opacity-0 
    after:transition-opacity 
    after:duration-200 
    hover:after:opacity-20
  `,

    // Danger - Modern red
    danger: `
    bg-gradient-to-r 
    from-red-600 
    to-red-700 
    text-white 
    hover:from-red-700 
    hover:to-red-800 
    focus:ring-red-500 
    focus:ring-offset-white 
    shadow-md 
    hover:shadow-lg 
    border 
    border-red-600 
    hover:border-red-700
    after:content-[''] 
    after:absolute 
    after:inset-0 
    after:bg-gradient-to-r 
    after:from-white 
    after:to-transparent 
    after:opacity-0 
    after:transition-opacity 
    after:duration-200 
    hover:after:opacity-10
  `,

    // Success - Modern green
    success: `
    bg-gradient-to-r 
    from-green-600 
    to-green-700 
    text-white 
    hover:from-green-700 
    hover:to-green-800 
    focus:ring-green-500 
    focus:ring-offset-white 
    shadow-md 
    hover:shadow-lg 
    border 
    border-green-600 
    hover:border-green-700
    after:content-[''] 
    after:absolute 
    after:inset-0 
    after:bg-gradient-to-r 
    after:from-white 
    after:to-transparent 
    after:opacity-0 
    after:transition-opacity 
    after:duration-200 
    hover:after:opacity-10
  `,

    // Warning - Modern amber/orange
    warning: `
    bg-gradient-to-r 
    from-amber-500 
    to-amber-600 
    text-white 
    hover:from-amber-600 
    hover:to-amber-700 
    focus:ring-amber-500 
    focus:ring-offset-white 
    shadow-md 
    hover:shadow-lg 
    border 
    border-amber-500 
    hover:border-amber-600
    after:content-[''] 
    after:absolute 
    after:inset-0 
    after:bg-gradient-to-r 
    after:from-white 
    after:to-transparent 
    after:opacity-0 
    after:transition-opacity 
    after:duration-200 
    hover:after:opacity-10
  `,

    // Outline - Modern bordered
    outline: `
    bg-transparent 
    text-gray-700 
    border 
    border-gray-300 
    hover:bg-gray-50 
    hover:border-gray-400 
    hover:text-gray-900 
    focus:ring-blue-500 
    focus:ring-offset-white 
    focus:border-blue-500 
    active:bg-gray-100 
    shadow-sm 
    hover:shadow-md
    after:content-[''] 
    after:absolute 
    after:inset-0 
    after:bg-gray-100 
    after:opacity-0 
    after:transition-opacity 
    after:duration-200 
    hover:after:opacity-100
  `,

    // Ghost - Minimal
    ghost: `
    bg-transparent 
    text-gray-600 
    hover:bg-gray-100 
    hover:text-gray-900 
    focus:ring-gray-500 
    focus:ring-offset-white 
    active:bg-gray-200
    border 
    border-transparent 
    hover:border-gray-200
  `,

    // Link - Text-like
    link: `
    bg-transparent 
    text-blue-600 
    hover:text-blue-700 
    hover:underline 
    focus:ring-blue-500 
    focus:ring-offset-white 
    border 
    border-transparent 
    px-2 
    py-1
    shadow-none
    hover:shadow-none
  `,
};

export const iconOnlySizeClasses = {
    xs: 'p-1.5 min-w-[28px] min-h-[28px]',
    sm: 'p-2 min-w-[36px] min-h-[36px]',
    md: 'p-2.5 min-w-[42px] min-h-[42px]',
    lg: 'p-3 min-w-[48px] min-h-[48px]',
    xl: 'p-3.5 min-w-[52px] min-h-[52px]',
};

export const roundedClasses = {
    default: 'rounded-lg',
    full: 'rounded-full',
    none: 'rounded-none',
};

export const shadowClasses = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
};