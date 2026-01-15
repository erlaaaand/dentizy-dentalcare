import { EmptyPatientsStateProps } from "./empty-state.types";
import { EmptyDataState } from "./EmptyDataState";
import { DefaultIcons } from "./empty-state.icons";

export function EmptyPatientsState({
    onAddPatient,
    onImportPatients,
    ...props
}: EmptyPatientsStateProps) {
    return (
        <EmptyDataState
            resource="patients"
            createAction={
                onAddPatient && (
                    <button
                        onClick={onAddPatient}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Add First Patient
                    </button>
                )
            }
            importAction={
                onImportPatients && (
                    <button
                        onClick={onImportPatients}
                        className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Import Patients
                    </button>
                )
            }
            {...props}
        />
    );
}