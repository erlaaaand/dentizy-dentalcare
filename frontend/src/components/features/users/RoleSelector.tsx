'use client';

import React, { useState, useEffect } from 'react';
import { Role, ID } from '@/types/api';
import { roleService } from '@/lib/api';
import { Shield } from 'lucide-react';

interface RoleSelectorProps {
    selectedRoles: ID[];
    onChange: (roles: ID[]) => void;
    disabled?: boolean;
}

export function RoleSelector({ selectedRoles, onChange, disabled = false }: RoleSelectorProps) {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        setLoading(true);
        try {
            const data = await roleService.getAll();
            setRoles(data);
        } catch (error) {
            console.error('Failed to load roles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (roleId: ID) => {
        const isSelected = selectedRoles.includes(roleId);

        if (isSelected) {
            onChange(selectedRoles.filter(id => id !== roleId));
        } else {
            onChange([...selectedRoles, roleId]);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-4">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {roles.map((role) => (
                <label
                    key={role.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${disabled
                            ? 'bg-gray-50 cursor-not-allowed'
                            : 'hover:bg-gray-50 cursor-pointer'
                        } ${selectedRoles.includes(role.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300'
                        }`}
                >
                    <input
                        type="checkbox"
                        checked={selectedRoles.includes(role.id)}
                        onChange={() => handleToggle(role.id)}
                        disabled={disabled}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />

                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-gray-600" />
                            <span className="font-medium text-gray-900">{role.name}</span>
                        </div>
                        {role.description && (
                            <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                        )}
                    </div>
                </label>
            ))}
        </div>
    );
}