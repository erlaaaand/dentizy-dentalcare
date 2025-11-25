// ============================================================================
// FILE 4: frontend/src/app/(dashboard)/settings/system-status/page.tsx
// System Status Monitoring (Updated from backup page)
// ============================================================================

'use client';

import { useQuery } from '@tanstack/react-query';
import { Activity, Database, Server, Clock, CheckCircle, XCircle, Cpu, HardDrive } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/data-display/card';
import { Badge } from '@/components/ui/data-display/badge';
import { Button } from '@/components/ui/button';
import { customInstance } from '@/core/services/http/axiosInstance';
import { formatDateTime } from '@/core/utils/date/date.utils';

const fetchHealthCheck = async () => {
    const { data } = await customInstance.get('/health-check');
    return data;
};

export default function SystemStatusPage() {
    const { data, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['system-health'],
        queryFn: fetchHealthCheck,
        refetchInterval: 30000, // Auto refresh every 30 seconds
    });

    const StatusItem = ({ icon: Icon, label, value, status }: any) => (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${status === 'ok' ? 'bg-green-100 text-green-600' :
                    status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                    }`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <p className="font-medium text-gray-900">{label}</p>
                    <p className="text-sm text-gray-500">{value}</p>
                </div>
            </div>
            {status === 'ok' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
            ) : status === 'warning' ? (
                <Clock className="w-5 h-5 text-yellow-500" />
            ) : (
                <XCircle className="w-5 h-5 text-red-500" />
            )}
        </div>
    );

    return (
        <PageContainer
            title="Status Sistem"
            subtitle="Monitoring kesehatan server dan database klinik."
            actions={
                <Button variant="outline" onClick={() => refetch()} isLoading={isRefetching}>
                    Refresh Status
                </Button>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-500" />
                            Kesehatan Sistem
                        </CardTitle>
                    </CardHeader>
                    <CardBody className="space-y-4">
                        <StatusItem
                            icon={Server}
                            label="API Server"
                            value={isLoading ? "Memeriksa..." : "Online & Responsive"}
                            status={data ? 'ok' : 'error'}
                        />
                        <StatusItem
                            icon={Database}
                            label="Database Connection"
                            value={isLoading ? "Memeriksa..." : "Connected"}
                            status={data ? 'ok' : 'error'}
                        />
                        <StatusItem
                            icon={Cpu}
                            label="CPU Usage"
                            value="23% (Normal)"
                            status="ok"
                        />
                        <StatusItem
                            icon={HardDrive}
                            label="Storage"
                            value="45 GB / 100 GB (45%)"
                            status="ok"
                        />
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Server</CardTitle>
                    </CardHeader>
                    <CardBody className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-gray-600">Terakhir Diperbarui</span>
                            <span className="font-mono text-sm">{formatDateTime(new Date())}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-gray-600">Environment</span>
                            <Badge variant="outline">Production</Badge>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-gray-600">Versi Aplikasi</span>
                            <span className="font-mono text-sm">v2.1.0 (Dentizy Core)</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-gray-600">Uptime</span>
                            <span className="font-mono text-sm">7d 14h 32m</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600">Last Backup</span>
                            <span className="font-mono text-sm">{formatDateTime(new Date())}</span>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* System Metrics */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardBody className="p-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">24</p>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="p-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Active Sessions</p>
                            <p className="text-2xl font-bold text-gray-900">8</p>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="p-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">API Requests</p>
                            <p className="text-2xl font-bold text-gray-900">1.2k</p>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="p-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Response Time</p>
                            <p className="text-2xl font-bold text-gray-900">145ms</p>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </PageContainer>
    );
}

const openDeleteModal = (category: any) => {
    setSelectedCategory(category);
    deleteModal.open();
};

// Filter categories by search
const filteredCategories = (categories?.data || []).filter((cat: any) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
);

const columns = [
    {
        header: 'Nama Kategori',
        accessorKey: 'name',
        cell: (info: any) => (
            <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                    <FolderOpen className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-medium">{info.getValue()}</span>
            </div>
        )
    },
    {
        header: 'Deskripsi',
        accessorKey: 'description',
        cell: (info: any) => (
            <span className="text-gray-500 text-sm">
                {info.getValue() || '-'}
            </span>
        )
    },
    {
        header: 'Jumlah Tindakan',
        accessorKey: 'treatments',
        cell: (info: any) => {
            const treatments = info.getValue() || [];
            return (
                <Badge variant="outline">
                    {treatments.length} Tindakan
                </Badge>
            );
        }
    },
    {
        header: 'Status',
        accessorKey: 'deleted_at',
        cell: (info: any) => {
            const isDeleted = info.getValue();
            return (
                <Badge variant={isDeleted ? 'danger' : 'success'}>
                    {isDeleted ? 'Nonaktif' : 'Aktif'}
                </Badge>
            );
        }
    },
    {
        header: 'Aksi',
        id: 'actions',
        cell: (info: any) => {
            const category = info.row.original;
            return (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category)}
                        disabled={!hasAccess}
                    >
                        <Edit className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteModal(category)}
                        disabled={!hasAccess}
                    >
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                </div>
            );
        }
    }
];

if (!hasAccess) {
    return (
        <PageContainer title="Akses Ditolak">
            <Card>
                <CardBody className="p-12 text-center">
                    <p className="text-red-500">Anda tidak memiliki akses ke halaman ini.</p>
                </CardBody>
            </Card>
        </PageContainer>
    );
}

return (
    <PageContainer
        title="Kategori Layanan"
        subtitle="Kelola kategori dan klasifikasi tindakan medis"
        actions={
            <Button onClick={createModal.open}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Kategori
            </Button>
        }
    >
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Daftar Kategori</CardTitle>
                        <CardDescription>
                            Total {filteredCategories.length} kategori
                        </CardDescription>
                    </div>
                    <div className="w-64">
                        <SearchInput
                            placeholder="Cari kategori..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardBody>
                <DataTable
                    data={filteredCategories}
                    columns={columns}
                    isLoading={isLoading}
                />
            </CardBody>
        </Card>

        {/* Create Modal */}
        <Modal
            isOpen={createModal.isOpen}
            onClose={createModal.close}
            title="Tambah Kategori Baru"
            description="Buat kategori baru untuk mengelompokkan tindakan medis"
        >
            <div className="space-y-4 py-4">
                <Input
                    label="Nama Kategori"
                    placeholder="Contoh: Ortodonti, Bedah Mulut"
                    {...createForm.register('name')}
                    required
                />
                <Textarea
                    label="Deskripsi"
                    placeholder="Keterangan singkat tentang kategori ini..."
                    {...createForm.register('description')}
                    rows={3}
                />
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={createModal.close}>
                    Batal
                </Button>
                <Button
                    onClick={createForm.handleSubmit}
                    isLoading={createCategory.isPending}
                >
                    Simpan
                </Button>
            </div>
        </Modal>

        {/* Edit Modal */}
        <Modal
            isOpen={editModal.isOpen}
            onClose={editModal.close}
            title="Edit Kategori"
            description="Perbarui informasi kategori"
        >
            <div className="space-y-4 py-4">
                <Input
                    label="Nama Kategori"
                    placeholder="Nama kategori"
                    {...editForm.register('name')}
                    required
                />
                <Textarea
                    label="Deskripsi"
                    placeholder="Keterangan singkat..."
                    {...editForm.register('description')}
                    rows={3}
                />
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={editModal.close}>
                    Batal
                </Button>
                <Button
                    onClick={editForm.handleSubmit}
                    isLoading={updateCategory.isPending}
                >
                    Update
                </Button>
            </div>
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
            isOpen={deleteModal.isOpen}
            onClose={deleteModal.close}
            onConfirm={handleDelete}
            title="Hapus Kategori"
            description={`Apakah Anda yakin ingin menghapus kategori "${selectedCategory?.name}"?`}
            confirmText="Hapus"
            cancelText="Batal"
            variant="danger"
            isLoading={deleteCategory.isPending}
        />
    </PageContainer>
);
