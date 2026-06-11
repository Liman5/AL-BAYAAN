'use client';

import React from 'react';
import { Bell, Settings, LogOut, BookOpen } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export const AdminHeaderComponent: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 md:px-6 py-4 md:py-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 text-white rounded-lg p-2">
                <BookOpen size={24} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="text-xs md:text-sm text-gray-500">{subtitle}</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
              <Bell size={20} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
              <Settings size={20} />
            </button>
            <button className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
