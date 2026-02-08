"use client"

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export const withAuth = (Component: React.ComponentType, allowedRoles?: string[]) => {
    return function ProtectedRoute(props: any) {
        const { user, loading } = useAuth();
        const router = useRouter();

        useEffect(() => {
            if (!loading) {
                if (!user) {
                    router.push('/');
                } else if (allowedRoles && !allowedRoles.includes(user.userType)) {
                    // Redirect to their own dashboard if they have the wrong role
                    if (user.userType === 'ADMIN') router.push('/admin');
                    else if (user.userType === 'CLIENT') router.push('/client');
                    else if (user.userType === 'LIVREUR') router.push('/livreur');
                    else router.push('/');
                }
            }
        }, [user, loading, router]);

        if (loading || !user || (allowedRoles && !allowedRoles.includes(user.userType))) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                </div>
            );
        }

        return <Component {...props} />;
    };
};
