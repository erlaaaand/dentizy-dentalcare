'use client';

import React from 'react';
import { User } from '@/core/types/api';
import { getInitials } from '@/core/formatters';
import { USER_ROLE_LABELS } from '@/lib/constants';
import { Shield } from 'lucide-react';

interface UserCardProps {
    user: User;
    onClick?: () => void;
}

export function UserCard({ user, onClick }: UserCardProps) {
    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all ${onClick ? 'hover:shadow-md hover:border-blue-300 cursor-pointer' : ''
                }`}
        >
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-semibold text-lg">
                        {getInitials(user.nama_lengkap)}
                    </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">
                        {user.nama_lengkap}
                    </h3>

                    <p className="text-sm text-gray-600 mb-2">@{user.username}</p>

                    <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                            <span
                                key={role.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                            >
                                <Shield className="w-3 h-3" />
                                {USER_ROLE_LABELS[role.name] || role.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}