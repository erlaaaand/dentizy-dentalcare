import { EmptyMedicalRecordsStateProps } from "./empty-state.types";
import { EmptyState } from "./EmptyState";
import { DefaultIcons } from "./empty-state.icons";

export function EmptyMedicalRecordsState({
    patientName,
    onAddRecord,
    ...props
}: EmptyMedicalRecordsStateProps) {
    return (
        <EmptyState
            icon={<DefaultIcons.Document className="w-full h-full" />}
            title={patientName ? `No records for ${patientName}` : 'No medical records'}
            description={
                patientName
                    ? `There are no medical records for ${patientName} yet. Add the first record to start tracking their dental health.`
                    : "No medical records found. Start by adding records for your patients."
            }
            action={onAddRecord && (
                <button
                    onClick={onAddRecord}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    Add Medical Record
                </button>
            )}
            {...props}
        />
    );
}