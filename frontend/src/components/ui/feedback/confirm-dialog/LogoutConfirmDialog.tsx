import { LogoutConfirmDialogProps } from "./confirm-dialog.types";
import ConfirmDialog from "./ConfirmDialog";

export function LogoutConfirmDialog({
    userName,
    message,
    ...props
}: LogoutConfirmDialogProps) {
    const defaultMessage = message || (
        <p>
            Are you sure you want to logout{userName ? `, ${userName}` : ''}?
        </p>
    );

    return (
        <ConfirmDialog
            type="logout"
            message={defaultMessage}
            confirmText={props.confirmText || 'Logout'}
            {...props}
        />
    );
}