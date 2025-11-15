import { Toast } from "./Toast";
import { SuccessToastProps } from "./toast.types";

export function SuccessToast({ title = 'Success!', message, ...props }: SuccessToastProps) {
    return (
        <Toast
            type="success"
            message={message}
            {...props}
        />
    );
}