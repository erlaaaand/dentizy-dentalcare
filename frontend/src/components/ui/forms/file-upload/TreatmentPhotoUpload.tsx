export function TreatmentPhotoUpload({
    stage = 'before',
    maxSize = 8 * 1024 * 1024, // 8MB for high-quality photos
    multiple = true,
    ...props
}: TreatmentPhotoUploadProps) {
    const stageLabels = {
        before: 'Sebelum Perawatan',
        during: 'Proses Perawatan',
        after: 'Setelah Perawatan',
    };

    return (
        <FileUpload
            accept="image/*"
            multiple={multiple}
            maxSize={maxSize}
            maxFiles={10}
            label={`Foto ${stageLabels[stage]}`}
            hint="Format: JPG, PNG (Max. 8MB per file, maks. 10 file)"
            {...props}
        />
    );
}