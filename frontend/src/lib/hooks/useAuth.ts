'use client';
import { useState, useEffect } from 'react';
// Anda perlu membuat endpoint di backend, misal: GET /auth/profile
// untuk mendapatkan data user berdasarkan token
// import { getProfile } from '@/lib/api/authService';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          // const profile = await getProfile(); // Panggil API
          // setUser(profile.data);
        } catch (error) {
          // Token tidak valid, logout
          localStorage.removeItem('access_token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  return { user, loading };
}