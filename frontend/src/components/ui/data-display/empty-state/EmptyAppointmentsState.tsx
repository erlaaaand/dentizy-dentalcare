import { EmptyAppointmentsStateProps } from "./empty-state.types";
import { default as EmptyState } from "./EmptyState";
import { DefaultIcons } from "./empty-state.icons";

export function EmptyAppointmentsState({
    onScheduleAppointment,
    date,
    ...props
}: EmptyAppointmentsStateProps) {
    return (
        <EmptyState
            icon={<DefaultIcons.Calendar className="w-full h-full" />}
            title={date ? `No appointments on ${date}` : 'No appointments scheduled'}
            description={
                date
                    ? "There are no appointments scheduled for this date. Schedule a new appointment to get started."
                    : "You don't have any appointments scheduled yet. Schedule your first appointment to get started."
            }
            action={onScheduleAppointment && (
                <button
                    onClick={onScheduleAppointment}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    Schedule Appointment
                </button>
            )}
            {...props}
        />
    );
}