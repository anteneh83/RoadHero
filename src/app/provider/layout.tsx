import React from 'react';
import { ProviderSidebar } from '@/components/ProviderSidebar';
import { NotificationDrawer } from '@/components/NotificationDrawer';
import { Toast } from '@/components/Toast';

export default function ProviderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-[#0A0A0A] overflow-hidden transition-colors duration-500">
            <ProviderSidebar />
            <NotificationDrawer />
            <Toast />
            <main className="flex-1 overflow-y-auto">
                <div className="p-8 lg:p-12">
                    {children}
                </div>
            </main>
        </div>
    );
}
