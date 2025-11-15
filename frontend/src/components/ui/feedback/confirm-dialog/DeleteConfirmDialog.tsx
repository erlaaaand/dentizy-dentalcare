import { DeleteConfirmDialogProps } from "./confirm-dialog.types";
import ConfirmDialog from "./ConfirmDialog";

export function DeleteConfirmDialog({
    itemName,
    itemType = 'item',
    permanent = false,
    message,
    ...props
}: DeleteConfirmDialogProps) {
    const defaultMessage = message || (
        <div className="space-y-2">
            <p>
                Are you sure you want to delete <strong>{itemName}</strong>?
            </p>
            {permanent && (
                <p className="text-sm text-red-600 font-medium">
                    This action cannot be undone. This will permanently delete the {itemType}.
                </p>
            )}
        </div>
    );

    return (
        <ConfirmDialog
            type="delete"
            message={defaultMessage}
            confirmText={props.confirmText || 'Delete'}
            destructive
            {...props}
        />
    );
}