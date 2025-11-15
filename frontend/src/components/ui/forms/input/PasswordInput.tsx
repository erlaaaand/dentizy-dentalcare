import React, { forwardRef } from 'react';
import { InputProps, PasswordInputProps } from './input.types';
import { Input } from './Input';
import { EyeIcon, EyeOffIcon } from './Icon.styles';

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ showPasswordToggle = true, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false);

        const togglePasswordVisibility = () => {
            setShowPassword(!showPassword);
        };

        return (
            <Input
                ref={ref}
                type={showPassword ? 'text' : 'password'}
                rightIcon={
                    showPasswordToggle ? (
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    ) : undefined
                }
                {...props}
            />
        );
    }
);

PasswordInput.displayName = 'PasswordInput';