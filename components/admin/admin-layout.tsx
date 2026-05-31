import React from 'react';
import {
  Users,
  BookOpen,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
} from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  onMenuToggle,
  isMenuOpen = false,
}) => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 md:px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 hover:bg-blue-500 rounded-lg transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-white text-blue-600 rounded-lg p-2">
              <BookOpen size={24} />
            </div>
            <h1 className="text-2xl font-bold hidden sm:block">ALBAYANE</h1>
          </div>
        </div>

        <h2 className="text-lg font-semibold flex-1 text-center md:text-left md:ml-4">
          {title}
        </h2>

        <div className="flex items-center gap-2 md:gap-4">
          <button className="p-2 hover:bg-blue-500 rounded-lg transition-colors">
            <Bell size={20} />
          </button>
          <button className="p-2 hover:bg-blue-500 rounded-lg transition-colors">
            <Settings size={20} />
          </button>
          <button className="p-2 hover:bg-red-500 rounded-lg transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

interface AdminNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  onClick?: () => void;
  badge?: number;
}

interface AdminSidebarProps {
  items: AdminNavItem[];
  activeItem: string;
  onItemClick: (itemId: string) => void;
  isOpen?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  items,
  activeItem,
  onItemClick,
  isOpen = true,
}) => {
  return (
    <aside
      className={`fixed md:static left-0 top-16 md:top-0 h-screen md:h-screen bg-gray-900 text-white transition-transform duration-300 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } w-64 md:w-64 lg:w-72 overflow-y-auto border-r border-gray-800`}
    >
      <nav className="p-6 space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeItem === item.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium flex-1 text-left">{item.label}</span>
            {item.badge && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer section */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800 bg-gray-800">
        <p className="text-xs text-gray-400 text-center">
          © 2024 ALBAYANE | Admin Dashboard v1.0
        </p>
      </div>
    </aside>
  );
};

interface AdminSearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  value?: string;
}

export const AdminSearchBar: React.FC<AdminSearchBarProps> = ({
  placeholder = 'Rechercher...',
  onSearch,
  value = '',
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onSearch?.(e.target.value)}
        className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color?: 'blue' | 'green' | 'red' | 'yellow';
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  green: 'bg-green-50 text-green-600 border-green-200',
  red: 'bg-red-50 text-red-600 border-red-200',
  yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend,
  color = 'blue',
}) => {
  return (
    <div
      className={`p-6 rounded-lg border ${colorClasses[color]} shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
          {trend && (
            <p
              className={`text-xs mt-2 ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}% par rapport au mois dernier
            </p>
          )}
        </div>
        <div className="p-3 bg-white rounded-lg">{icon}</div>
      </div>
    </div>
  );
};

interface ActionButtonProps {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  isLoading?: boolean;
}

const variantClasses = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  icon,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`flex items-center gap-2 rounded-lg font-semibold transition-all ${
        variantClasses[variant]
      } ${sizeClasses[size]} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isLoading ? (
        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
      ) : (
        icon
      )}
      {label}
    </button>
  );
};
