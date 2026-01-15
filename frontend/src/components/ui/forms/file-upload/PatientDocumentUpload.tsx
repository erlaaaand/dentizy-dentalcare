import { PatientDocumentUploadProps } from './file-upload.types'
import FileUpload from './FileUpload';

export function PatientDocumentUpload({
    documentType = 'medical_record',
    maxSize = 5 * 1024 * 1024,
    ...props
}: PatientDocumentUploadProps) {
    const typeConfig = {
        medical_record: {
            label: 'Rekam Medis',
            accept: '.pdf,.doc,.docx',
            hint: 'Format: PDF, DOC, DOCX (Max. 5MB)',
        },
        insurance: {
            label: 'Dokumen Asuransi',
            accept: '.pdf,.jpg,.jpeg,.png',
            hint: 'Format: PDF, JPG, PNG (Max. 5MB)',
        },
        prescription: {
            label: 'Resep Obat',
            accept: '.pdf,.jpg,.jpeg,.png',
            hint: 'Format: PDF, JPG, PNG (Max. 5MB)',
        },
        referral: {
            label: 'Surat Rujukan',
            accept: '.pdf,.doc,.docx',
            hint: 'Format: PDF, DOC, DOCX (Max. 5MB)',
        },
    };

    const config = typeConfig[documentType];

    return (
        <FileUpload
            accept={config.accept}
            maxSize={maxSize}
            label={`Upload ${config.label}`}
            hint={config.hint}
            {...props}
        />
    );
}