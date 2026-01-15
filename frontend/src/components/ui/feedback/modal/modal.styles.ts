export const sizeClasses = {
    xs: 'max-w-xs w-full',
    sm: 'max-w-sm w-full',
    md: 'max-w-md w-full',
    lg: 'max-w-lg w-full',
    xl: 'max-w-4xl w-full', // <--- PENTING: Tambahkan w-full di sini
    full: 'max-w-7xl w-full mx-4',
    auto: 'max-w-max w-full',
};

export const backdropClasses = {
    blur: 'bg-black/50 backdrop-blur-sm',
    transparent: 'bg-transparent',
    opaque: 'bg-black/75',
};

export const animationClasses = {
    fade: 'animate-in fade-in duration-300',
    slide: 'animate-in slide-in-from-bottom duration-300',
    scale: 'animate-in zoom-in-95 duration-300',
    none: '',
};

export const fullscreenClasses = {
    true: 'fixed inset-4 m-0 max-w-none w-auto h-auto',
    false: '',
};