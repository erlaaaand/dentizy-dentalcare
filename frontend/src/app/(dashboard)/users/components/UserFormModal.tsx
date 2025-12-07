'use client';

import { useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/feedback/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/forms/input';
import { FormSelect } from '@/components/ui/forms/select';
import { PasswordInput } from '@/components/ui/forms/input/PasswordInput';
import { useForm } from '@/core/hooks/forms/useForm';
import { useToast } from '@/core/hooks/ui/useToast';
import { Loader2, Save, UserPlus } from 'lucide-react';
import { z } from 'zod';
import type { CreateUserDto, UpdateUserDto } from '@/core/api/model';
import { useCreateUser, useUpdateUser } from '@/core/services/api/user.api';
import { useGetRoles } from '@/core/services/api/role.api';

/* ============================
   TYPE DEFINITIONS
============================= */

interface Role {
    id: number;
    name: string;
}

interface UserData {
    id: number | string;
    nama_lengkap: string;
    username: string;
    email?: string;
    roles?: Role[];
}

interface ApiError {
    response?: {
        data?: {
            message?: string | string[];
        };
    };
}

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: UserData;
    onSuccess: () => void;
}

/* ============================
   VALIDATION SCHEMA
============================= */

const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

const userSchema = z.object({
    nama_lengkap: z.string().min(3, 'Nama minimal 3 karakter'),
    username: z.string().min(3, 'Username minimal 3 karakter'),
    email: z.string().email('Email tidak valid').optional().or(z.literal('')),
    roleId: z.string().min(1, 'Role wajib dipilih'),
    password: z
        .string()
        .optional()
        .refine((val) => {
            if (!val) return true;
            return PASSWORD_REGEX.test(val);
        }, {
            message:
                'Password harus mengandung Huruf Besar, Kecil, Angka, Simbol & Min 8 Karakter',
        }),
});

export default function UserFormModal({
    isOpen,
    onClose,
    initialData,
    onSuccess,
}: UserFormModalProps) {
    const toast = useToast();
    const { data: rolesData } = useGetRoles();
    const createMutation = useCreateUser();
    const updateMutation = useUpdateUser();

    const isEdit = !!initialData;
    const isLoading = createMutation.isPending || updateMutation.isPending;

    /* ============================
       SAFE ROLE OPTIONS
    ============================= */

    const roleOptions = useMemo(() => {
        const list: Role[] =
            Array.isArray(rolesData)
                ? rolesData
                : (rolesData as { data?: Role[] } | undefined)?.data ?? [];

        return list.map((r) => ({
            label: r.name.replace(/_/g, ' ').toUpperCase(),
            value: String(r.id),
        }));
    }, [rolesData]);

    /* ============================
       FORM HANDLING
    ============================= */

    const form = useForm({
        initialValues: {
            nama_lengkap: '',
            username: '',
            email: '',
            password: '',
            roleId: '',
        },
        validationSchema: userSchema,
        validateOnChange: false,

        onSubmit: async (values) => {
            try {
                if (!isEdit && !values.password) {
                    form.setFieldError(
                        'password',
                        'Password wajib diisi untuk pengguna baru'
                    );
                    return;
                }

                const payload: CreateUserDto | UpdateUserDto = {
                    nama_lengkap: values.nama_lengkap,
                    username: values.username,
                    email: values.email || undefined,
                    roles: values.roleId ? [Number(values.roleId)] : [],
                    password: values.password || undefined, // password opsional saat update
                };

                if (values.password) {
                    payload.password = values.password;
                }

                if (isEdit && initialData) {
                    // Payload untuk update
                    const payload: UpdateUserDto = {
                        nama_lengkap: values.nama_lengkap || undefined,
                        username: values.username || undefined,
                        email: values.email || undefined,
                        roles: values.roleId ? [Number(values.roleId)] : undefined,
                        password: values.password || undefined,
                    };

                    await updateMutation.mutateAsync({
                        id: Number(initialData.id),
                        data: payload,
                    });

                    toast.showSuccess('Data pengguna diperbarui');
                } else {
                    // Payload untuk create
                    const payload: CreateUserDto = {
                        nama_lengkap: values.nama_lengkap, // wajib string
                        username: values.username,          // wajib string
                        email: values.email || undefined,   // optional
                        roles: values.roleId ? [Number(values.roleId)] : [], // wajib array
                        password: values.password!,          // wajib string
                    };

                    await createMutation.mutateAsync({
                        data: payload,
                    });

                    toast.showSuccess('Pengguna baru berhasil dibuat');
                }

                onSuccess();
                onClose();
            } catch (err: unknown) {
                const error = err as ApiError;
                const msg = error.response?.data?.message;

                if (Array.isArray(msg)) {
                    toast.showError(msg[0]);
                } else {
                    toast.showError(msg ?? 'Gagal menyimpan data');
                }
            }
        },
    });

    /* ============================
       HANDLE EDIT MODE
    ============================= */

    useEffect(() => {
        if (isOpen) {
            form.resetForm();

            if (initialData) {
                const currentRoleId =
                    initialData.roles?.[0]?.id != null
                        ? String(initialData.roles[0].id)
                        : '';

                form.setValues({
                    nama_lengkap: initialData.nama_lengkap ?? '',
                    username: initialData.username ?? '',
                    email: initialData.email ?? '',
                    password: '',
                    roleId: currentRoleId,
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, initialData]);

    /* ============================
       RENDER
    ============================= */

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
            description={
                isEdit
                    ? 'Perbarui informasi akun & akses.'
                    : 'Buat akun untuk staf atau dokter klinik.'
            }
            size="lg"
        >
            <form
                onSubmit={form.handleSubmit}
                className="space-y-4 py-4"
                autoComplete="off"
            >
                <input type="text" style={{ display: 'none' }} />
                <input type="password" style={{ display: 'none' }} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <Input
                            label="Nama Lengkap"
                            placeholder="Contoh: Budi Santoso, S.Kom"
                            value={form.values.nama_lengkap}
                            onChange={(e) =>
                                form.setFieldValue(
                                    'nama_lengkap',
                                    e.target.value
                                )
                            }
                            error={form.errors.nama_lengkap}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <Input
                        label="Username"
                        placeholder="budisantoso"
                        value={form.values.username}
                        onChange={(e) =>
                            form.setFieldValue('username', e.target.value)
                        }
                        error={form.errors.username}
                        disabled={isLoading}
                        required
                    />

                    <Input
                        label="Email"
                        type="email"
                        placeholder="email@klinik.com"
                        value={form.values.email}
                        onChange={(e) =>
                            form.setFieldValue('email', e.target.value)
                        }
                        error={form.errors.email}
                        disabled={isLoading}
                    />

                    <div className="md:col-span-2">
                        <FormSelect
                            label="Role / Jabatan"
                            placeholder="-- Pilih Role --"
                            options={roleOptions}
                            value={form.values.roleId}
                            onChange={(val) =>
                                form.setFieldValue('roleId', val)
                            }
                            error={form.errors.roleId}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="md:col-span-2 border-t pt-4 mt-2">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                            Keamanan
                        </p>

                        <PasswordInput
                            label={
                                isEdit
                                    ? 'Password Baru (Kosongkan jika tidak diubah)'
                                    : 'Password'
                            }
                            placeholder="********"
                            value={form.values.password}
                            onChange={(e) =>
                                form.setFieldValue('password', e.target.value)
                            }
                            error={form.errors.password}
                            disabled={isLoading}
                            autoComplete="new-password"
                        />

                        <p className="text-[11px] text-gray-500 mt-1">
                            *Password harus minimal 8 karakter, mengandung huruf
                            besar, kecil, angka, dan simbol.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Batal
                    </Button>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : isEdit ? (
                            <Save className="w-4 h-4 mr-2" />
                        ) : (
                            <UserPlus className="w-4 h-4 mr-2" />
                        )}
                        {isEdit ? 'Simpan Perubahan' : 'Buat Akun'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
