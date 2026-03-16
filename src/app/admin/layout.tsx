import React from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-[#FDFDFD] overflow-hidden">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="p-10 lg:p-16">
                    {children}
                </div>
            </main>
        </div>
    );
}
