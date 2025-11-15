import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
    children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    const pathname = usePathname();
    const isLoginPage = pathname === '/auth/login';
    const isRegisterPage = pathname === '/auth/register';

    return (
        <div className={styles.container}>
            <div className={styles.authBox}>
                <div className={styles.header}></div>
                <h1 className={styles.title}>Dentizy</h1>
                <div className={styles.formContainer}>{children}</div>
                <div className={styles.footer}>
                    {isLoginPage && (
                        <p className={styles.footerText}>
                            Don't have an account?{' '}
                            <Link href="/auth/register" className={styles.footerLink}>
                                Register
                            </Link>
                        </p>
                    )}
                    {isRegisterPage && (
                        <p className={styles.footerText}>
                            Already have an account?{' '}
                            <Link href="/auth/login" className={styles.footerLink}>
                                Login
                            </Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;