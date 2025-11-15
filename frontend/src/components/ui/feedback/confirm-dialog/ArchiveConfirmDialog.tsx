import { ArchiveConfirmDialogProps } from "./confirm-dialog.types";
import ConfirmDialog from "./ConfirmDialog";

export function ArchiveConfirmDialog({
    itemName,
    itemType = 'item',
    message,
    ...props
}: ArchiveConfirmDialogProps) {
    const defaultMessage = message || (
        <div className="space-y-2">
            <p>
                Are you sure you want to archive <strong>{itemName}</strong>?
            </p>
            <p className="text-sm text-gray-600">
                Archived {itemType}s can be restored later from the archive section.
            </p>
        </div>
    );

    return (
        <ConfirmDialog
            type="archive"
            message={defaultMessage}
            confirmText={props.confirmText || 'Archive'}
            {...props}
        />
    );
}