import { PatientLoadingProps } from "./loading-spinner.types";

export function PatientLoading({
    showProfile = true,
    showMedicalHistory = true,
}: PatientLoadingProps) {
    return (
        <div className="space-y-6">
            {showProfile && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />
                        <div className="flex-1 space-y-3">
                            <div className="h-6 bg-gray-200 rounded animate-pulse w-48" />
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-64" />
                            <div className="flex gap-2">
                                <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
                                <div className="h-6 bg-gray-200 rounded animate-pulse w-24" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showMedicalHistory && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-40 mb-4" />
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}