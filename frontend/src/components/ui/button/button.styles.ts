import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  // Base styles
  [
    'inline-flex items-center justify-center whitespace-nowrap',
    'rounded-lg text-sm font-medium',
    'ring-offset-white transition-all duration-200 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.97]', // Efek tactile (membal) saat diklik
  ].join(' '),
  {
    variants: {
      variant: {
        primary:
          'bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 border border-transparent',
        secondary:
          'bg-white text-gray-900 border border-gray-200 shadow-sm hover:bg-gray-50 hover:text-gray-950',
        danger:
          'bg-red-600 text-white shadow-md shadow-red-500/20 hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/30 border border-transparent',
        success:
          'bg-green-600 text-white shadow-md shadow-green-500/20 hover:bg-green-700 hover:shadow-lg hover:shadow-green-500/30 border border-transparent',
        warning:
          'bg-amber-500 text-white shadow-md shadow-amber-500/20 hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/30 border border-transparent',
        outline:
          'border border-gray-300 bg-transparent hover:bg-gray-100 hover:text-gray-900',
        ghost:
          'hover:bg-gray-100 hover:text-gray-900 text-gray-600',
        link:
          'text-blue-600 underline-offset-4 hover:underline shadow-none p-0 h-auto active:scale-100',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs',
        sm: 'h-9 px-3',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-8 text-base',
        xl: 'h-14 px-10 text-lg',
        icon: 'h-10 w-10 p-0', // Ukuran khusus untuk IconButton
        'icon-sm': 'h-9 w-9 p-0',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);