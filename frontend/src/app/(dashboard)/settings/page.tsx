'use client';

import { useQueryClient } from '@tanstack/react-query';
import { UserPlus, Shield, Trash2 } from 'lucide-react';

import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-display/datatable';
import { Badge } from '@/components/ui/data-display/badge';
import { Modal } from '@/components/ui/feedback/modal';
import { Input } from '@/components/ui/forms/input';
import { FormSelect } from '@/components/ui/forms/select';
import { PasswordInput } from '@/components/ui/forms/input/PasswordInput';
import { default as Avatar } from '@/components/ui/data-display/avatar/Avatar';

import { useAuth } from '@/core/hooks/auth/useAuth';
import { useRole } from '@/core/hooks/auth/useRole';
import { useToast } from '@/core/hooks/ui/useToast';
import { useModal } from '@/core/hooks/ui/useModal';
import { useForm } from '@/core/hooks/forms/useForm';
import { useGetUsers, useCreateUser, useDeleteUser } from '@/core/services/api/user.api';
import { useGetRoles } from '@/core/services/api/role.api';
import { ROLES } from '@/core/constants/role.constants';

export default function UserSettingsPage() {
    const { user: currentUser } = useAuth();
    const { isKepalaKlinik } = useRole();

    const toast = useToast();
    const queryClient = useQueryClient();

    // Services
    const { data: users, isLoading: isLoadingUsers } = useGetUsers();
    const { data: rolesData } = useGetRoles();

    const createUser = useCreateUser();
    const deleteUser = useDeleteUser();

    // Modal
    const createModal = useModal();

    // Form Configuration
    const form = useForm({
        initialValues: {
            name: '',
            username: '',
            email: '', // Optional di DTO tapi ada di form sebelumnya
            password: '',
            roleId: '',
            specialization: '',
        },
        onSubmit: async (values) => {
            try {
                await createUser.mutateAsync({
                    nama_lengkap: values.name,
                    username: values.username,
                    password: values.password,
                    roles: values.roleId ? [Number(values.roleId)] : [],
                });

                toast.success('Pengguna berhasil ditambahkan');
                createModal.close();
                form.reset();
                queryClient.invalidateQueries({ queryKey: ['users'] });
            } catch (error) {
                toast.error('Gagal menambahkan pengguna');
            }
        }
    });

    const handleDelete = async (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
            try {
                await deleteUser.mutateAsync(id);
                toast.success('Pengguna dihapus');
                queryClient.invalidateQueries({ queryKey: ['users'] });
            } catch (e) {
                toast.error('Gagal menghapus pengguna');
            }
        }
    };

    const isDoctorSelected = () => {
        if (!rolesData || !form.values.roleId) return false;
        const selectedRole = (rolesData as any)?.find((r: any) => r.id === Number(form.values.roleId));
        return selectedRole?.name === ROLES.DOKTER;
    };

    const columns = [
        {
            header: 'Nama & Username',
            accessorKey: 'nama_lengkap',
            cell: (info: any) => (
                <div className="flex items-center gap-3">
                    <Avatar
                        name={info.getValue()}
                        src={info.row.original.profile_photo}
                        size="sm"
                    />
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{info.getValue()}</span>
                        <span className="text-xs text-gray-500">@{info.row.original.username}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Role',
            accessorKey: 'roles',
            cell: (info: any) => {
                const userRoles = info.getValue() as any[];
                if (!userRoles || userRoles.length === 0) return <span className="text-gray-400">-</span>;

                return (
                    <div className="flex flex-wrap gap-1">
                        {userRoles.map((role) => {
                            const colors: Record<string, "primary" | "success" | "warning" | "default"> = {
                                [ROLES.KEPALA_KLINIK]: 'primary',
                                [ROLES.DOKTER]: 'success',
                                [ROLES.STAF]: 'warning'
                            };
                            return (
                                <Badge key={role.id} variant={colors[role.name] || 'default'} size="sm">
                                    {role.name.replace('_', ' ')}
                                </Badge>
                            );
                        })}
                    </div>
                );
            }
        },
        {
            header: 'Aksi',
            id: 'actions',
            cell: (info: any) => (
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={(info.row.original as any).id === currentUser?.id}
                    onClick={() => handleDelete((info.row.original as any).id)}
                >
                    <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
            )
        }
    ];

    if (!isKepalaKlinik) {
        return (
            <PageContainer title="Akses Ditolak">
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-gray-200 text-center">
                    <Shield className="w-16 h-16 text-red-500 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">Anda tidak memiliki akses</h3>
                    <p className="text-gray-500 mt-2">Halaman ini hanya dapat diakses oleh Kepala Klinik.</p>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer
            title="Manajemen Pengguna"
            subtitle="Kelola akun dokter, staf, dan admin klinik."
            actions={
                <Button onClick={createModal.open}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Tambah Pengguna
                </Button>
            }
        >
            <Card>
                <CardHeader>
                    <CardTitle>Daftar Pengguna Aktif</CardTitle>
                    <CardDescription>
                        Total {(users as any)?.meta?.total || 0} pengguna terdaftar dalam sistem.
                    </CardDescription>
                </CardHeader>
                <CardBody>
                    <DataTable
                        data={(users as any)?.data || []}
                        columns={columns}
                        isLoading={isLoadingUsers}
                    />
                </CardBody>
            </Card>

            <Modal
                isOpen={createModal.isOpen}
                onClose={createModal.close}
                title="Tambah Pengguna Baru"
                description="Buat akun baru untuk staf atau dokter."
            >
                <div className="space-y-4 py-4">
                    <Input
                        label="Nama Lengkap"
                        placeholder="Drg. Budi Santoso"
                        name="name"
                        value={form.values.name}
                        onChange={form.handleChange('name')}
                        error={form.errors.name}
                    />
                    <Input
                        label="Username"
                        placeholder="drg_budi"
                        name="username"
                        value={form.values.username}
                        onChange={form.handleChange('username')}
                        error={form.errors.username}
                    />
                    {/* Email opsional, tidak ada di CreateUserDto tapi bagus untuk UI */}
                    <Input
                        label="Email"
                        type="email"
                        placeholder="dokter@dentizy.com"
                        name="email"
                        value={form.values.email}
                        onChange={form.handleChange('email')}
                    />
                    <PasswordInput
                        label="Password"
                        placeholder="********"
                        name="password"
                        value={form.values.password}
                        onChange={form.handleChange('password')}
                        error={form.errors.password}
                    />

                    <FormSelect
                        label="Role / Jabatan"
                        placeholder="Pilih Role"
                        options={(rolesData as any)?.map((role: any) => ({
                            label: role.name.charAt(0).toUpperCase() + role.name.slice(1).replace('_', ' '),
                            value: role.id
                        })) || []}
                        value={form.values.roleId}
                        onChange={form.handleChange('roleId')}
                        error={form.errors.roleId}
                    />

                    {isDoctorSelected() && (
                        <Input
                            label="Spesialisasi"
                            placeholder="Contoh: Ortodonti"
                            name="specialization"
                            value={form.values.specialization}
                            onChange={form.handleChange('specialization')}
                        />
                    )}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={createModal.close}>Batal</Button>
                    <Button onClick={form.handleSubmit} isLoading={createUser.isPending}>Buat Akun</Button>
                </div>
            </Modal>
        </PageContainer>
    );
}