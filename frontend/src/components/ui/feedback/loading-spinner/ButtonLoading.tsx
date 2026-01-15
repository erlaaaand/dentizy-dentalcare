import { ButtonLoadingProps } from "./loading-spinner.types";
import { LoadingSpinner } from "./LoadingSpinner";

export function ButtonLoading({
    size = 'sm',
    variant = 'default',
}: ButtonLoadingProps) {
    const buttonVariantMap = {
        default: 'primary',
        primary: 'default',
        success: 'success',
        warning: 'warning',
        error: 'error',
    } as const;

    return (
        <LoadingSpinner
            size={size}
            variant={buttonVariantMap[variant]}
            showText={false}
            thickness="thin"
        />
    );
}