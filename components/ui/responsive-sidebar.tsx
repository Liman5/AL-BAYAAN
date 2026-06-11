'use client';

import React, { ReactNode } from 'react';
import { Menu, X } from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: number;
}

interface ResponsiveSidebarProps {
  items: SidebarItem[];
  activeItem: string;
  onItemClick: (itemId: string) => void;
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
  title?: string;
}

export const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({
  items,
  activeItem,
  onItemClick,
  isOpen,
  onToggle,
  title = 'Menu',
}) => {
  const handleItemClick = (itemId: string) => {
    onItemClick(itemId);
    // Fermer le menu mobile après sélection
    onToggle(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => onToggle(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={() => onToggle(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative md:flex-col top-0 left-0 h-screen md:h-auto w-64 md:w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-lg z-40 transform transition-transform duration-300 md:translate-x-0 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-xs text-gray-400 mt-1">Navigation</p>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2 flex-1">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeItem === item.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="flex-shrink-0 text-lg">{item.icon}</span>
              <span className="flex-1 text-left font-medium text-sm md:text-base">{item.label}</span>
              {item.badge !== undefined && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => handleItemClick('logout')}
            className="w-full px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </aside>
    </>
  );
};
