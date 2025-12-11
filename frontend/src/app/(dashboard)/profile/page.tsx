'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/core/hooks/auth/useAuth';
import { useToast } from '@/core/hooks/ui/useToast';
import { useQueryClient } from '@tanstack/react-query';

import { 
    useUsersControllerFindOne, 
    useUsersControllerUpdate, 
    useUsersControllerChangePassword 
} from '@/core/api/generated/users/users';
import { customInstance } from '@/core/services/http/axiosInstance'; 

const UserIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const LockIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);
const CameraIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
);
const SaveIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
);
const LoadingSpinner = () => (
    <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
);

// Tipe data untuk response upload
interface UploadResponse {
    message: string;
    url: string;
}

// Tipe data extended untuk user
interface ExtendedUserData {
    id: number;
    nama_lengkap: string;
    username: string;
    email?: string;
    profile_photo?: string;
    roles?: Array<{ name: string }>;
}

export default function ProfilePage() {
    const { user, isAuthenticated } = useAuth();
    const { showSuccess, showError } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();

    const userId = user?.id ? Number(user.id) : 0;

    const [activeTab, setActiveTab] = useState<'general' | 'security'>('general');
    const [isUploading, setIsUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Fetch Data User dengan type assertion
    const { data: userData, refetch } = useUsersControllerFindOne(userId, {
        query: { 
            enabled: !!userId,
            retry: false
        }
    });

    const updateProfileMutation = useUsersControllerUpdate();
    const changePasswordMutation = useUsersControllerChangePassword();

    const [formData, setFormData] = useState({
        nama_lengkap: '',
        username: '',
        email: '',
        profile_photo: ''
    });

    const [passData, setPassData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (userData) {
            const extendedUser = userData as ExtendedUserData;
            setFormData({
                nama_lengkap: extendedUser.nama_lengkap || '',
                username: extendedUser.username || '',
                email: extendedUser.email || '',
                profile_photo: extendedUser.profile_photo || ''
            });
            setPreviewImage(extendedUser.profile_photo || null);
        }
    }, [userData]);

    // --- HANDLERS ---

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            showError('Ukuran file maksimal 2MB');
            return;
        }

        setIsUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        try {
            const response = await customInstance<UploadResponse>({
                url: '/uploads/profile-photo',
                method: 'POST',
                data: uploadFormData,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const newPhotoUrl = response.url;
            
            setFormData(prev => ({ ...prev, profile_photo: newPhotoUrl }));
            setPreviewImage(newPhotoUrl);
            showSuccess('Foto berhasil diunggah. Klik "Simpan Perubahan" untuk menerapkan.');
        } catch (error) {
            console.error(error);
            showError('Gagal mengunggah foto.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        // Membuat payload sesuai dengan UpdateUserDto
        const payload = {
            nama_lengkap: formData.nama_lengkap,
            username: formData.username,
            email: formData.email,
            profile_photo: formData.profile_photo 
        };

        updateProfileMutation.mutate({
            id: userId,
            data: payload 
        }, {
            onSuccess: () => {
                showSuccess('Profil berhasil diperbarui!');
                refetch();
                queryClient.invalidateQueries({ queryKey: [`/users/${userId}`] });
            },
            onError: (err) => {
                const error = err as unknown as Error & { response?: { data?: { message?: string } } };
                const errorMessage = error?.response?.data?.message;
                showError(errorMessage || 'Gagal memperbarui profil');
            }
        });
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();

        if (passData.newPassword !== passData.confirmPassword) {
            showError('Konfirmasi password tidak sesuai!');
            return;
        }

        changePasswordMutation.mutate({
            data: {
                oldPassword: passData.oldPassword,
                newPassword: passData.newPassword,
                confirmPassword: passData.confirmPassword
            }
        }, {
            onSuccess: () => {
                showSuccess('Password berhasil diubah!');
                setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            },
            onError: (err) => {
                const error = err as unknown as Error & { response?: { data?: { message?: string } } };
                const errorMessage = error?.response?.data?.message;
                showError(errorMessage || 'Gagal mengubah password');
            }
        });
    };

    const getImageUrl = (url: string | null) => {
        if (!url) return 'https://ui-avatars.com/api/?background=random&name=' + (formData.nama_lengkap || 'User');
        if (url.startsWith('http')) return url;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        return `${apiUrl}${url}`; 
    };

    if (!isAuthenticated) return <div className="min-h-screen bg-white flex items-center justify-center"><LoadingSpinner /></div>;

    const extendedUserData = userData as ExtendedUserData | undefined;

    return (
        <div className="min-h-screen bg-white text-gray-900 p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Pengaturan Akun</h1>
                    <p className="text-gray-600 mt-2">Kelola informasi profil dan keamanan akun Anda.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    
                    {/* LEFT COLUMN */}
                    <div className="md:col-span-4 space-y-6">
                        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm text-center relative overflow-hidden">
                            <div className="relative inline-block group">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-50 mx-auto relative">
                                    {previewImage ? (
                                        <Image 
                                            src={getImageUrl(previewImage)} 
                                            alt="Profile" 
                                            width={128}
                                            height={128}
                                            className="w-full h-full object-cover"
                                            priority
                                            unoptimized={!previewImage.startsWith('http')}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-4xl font-bold">
                                            {formData.nama_lengkap?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                            <LoadingSpinner />
                                        </div>
                                    )}
                                </div>
                                
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    type="button"
                                    className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition shadow-lg group-hover:scale-110 z-20 cursor-pointer"
                                >
                                    <CameraIcon className="w-5 h-5 text-white" />
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange} 
                                    accept="image/*"
                                    className="hidden" 
                                />
                            </div>

                            <h2 className="mt-4 text-xl font-bold text-gray-900">{formData.nama_lengkap || 'User'}</h2>
                            <p className="text-sm text-blue-600 font-medium uppercase tracking-wider">
                                {extendedUserData?.roles?.[0]?.name || 'Member'}
                            </p>
                        </div>

                        <nav className="flex flex-col space-y-2">
                            <button
                                onClick={() => setActiveTab('general')}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                    activeTab === 'general' 
                                    ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                                    : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900 border border-transparent'
                                }`}
                            >
                                <UserIcon className="w-5 h-5" />
                                <span className="font-medium">Informasi Umum</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                    activeTab === 'security' 
                                    ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                                    : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900 border border-transparent'
                                }`}
                            >
                                <LockIcon className="w-5 h-5" />
                                <span className="font-medium">Keamanan & Password</span>
                            </button>
                        </nav>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="md:col-span-8">
                        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm min-h-[400px]">
                            
                            {/* TAB: GENERAL */}
                            {activeTab === 'general' && (
                                <form onSubmit={handleProfileUpdate} className="space-y-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold text-gray-900">Edit Profil</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-600 font-medium">Nama Lengkap</label>
                                            <input
                                                type="text"
                                                value={formData.nama_lengkap}
                                                onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})}
                                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                                placeholder="Nama Lengkap"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-600 font-medium">Username</label>
                                            <input
                                                type="text"
                                                value={formData.username}
                                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                                placeholder="Username"
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm text-gray-600 font-medium">Email</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                                placeholder="email@domain.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={updateProfileMutation.isPending}
                                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                        >
                                            {updateProfileMutation.isPending ? <LoadingSpinner /> : <SaveIcon className="w-5 h-5" />}
                                            <span>Simpan Perubahan</span>
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* TAB: SECURITY */}
                            {activeTab === 'security' && (
                                <form onSubmit={handleChangePassword} className="space-y-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold text-red-600">Ganti Password</h3>
                                    </div>

                                    <div className="space-y-4 max-w-lg">
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-600 font-medium">Password Lama</label>
                                            <input
                                                type="password"
                                                value={passData.oldPassword}
                                                onChange={(e) => setPassData({...passData, oldPassword: e.target.value})}
                                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-600 font-medium">Password Baru</label>
                                            <input
                                                type="password"
                                                value={passData.newPassword}
                                                onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                                                placeholder="Min. 8 karakter, huruf besar, angka"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-600 font-medium">Konfirmasi Password</label>
                                            <input
                                                type="password"
                                                value={passData.confirmPassword}
                                                onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={changePasswordMutation.isPending}
                                            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                        >
                                            {changePasswordMutation.isPending ? <LoadingSpinner /> : <LockIcon className="w-5 h-5" />}
                                            <span>Update Password</span>
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}