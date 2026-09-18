"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { SarthiChatWidget } from "@/components/shared/SarthiChatWidget";
import { OfflineBanner } from "@/components/shared/OfflineBanner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#fcfbf9] dark:bg-[#07130e]">
      <OfflineBanner />
      {/* Desktop Left Sidebar */}
      {/* Desktop Left Sidebar */}
      <div className="hidden lg:block lg:w-72 lg:shrink-0 sticky top-0 h-screen">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex w-72 max-w-xs flex-1 flex-col bg-[#fcfbf9] z-10 dark:bg-[#081510]">
            <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          title="Scholar Hub Portal"
          subtitle="Ministry of Tribal Affairs · National Affirmative Action Desk"
        />
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      {/* Floating Sarthi AI Assistant */}
      <SarthiChatWidget />
    </div>
  );
}
