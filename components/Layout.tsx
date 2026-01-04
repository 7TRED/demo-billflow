import React from 'react';
import { LayoutDashboard, FileCheck, Settings, Menu, X, Wallet } from 'lucide-react';
import { AppView, Organization } from '../types';
import clsx from 'clsx';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  organization: Organization;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate, organization }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const NavItem = ({ view, icon: Icon, label }: { view: AppView; icon: any; label: string }) => (
    <button
      onClick={() => {
        onNavigate(view);
        setIsMobileMenuOpen(false);
      }}
      className={clsx(
        "flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors",
        currentView === view
          ? "bg-blue-600 text-white"
          : "text-gray-600 hover:bg-gray-100"
      )}
    >
      <Icon className="w-5 h-5 mr-3" />
      {label}
    </button>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200">
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <Wallet className="w-8 h-8 text-blue-600 mr-2" />
          <span className="text-xl font-bold text-gray-800">BillFlow</span>
        </div>
        <div className="flex-1 px-4 py-6 space-y-2">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem view="verify" icon={FileCheck} label="Smart Verify" />
          <NavItem view="settings" icon={Settings} label="Settings" />
        </div>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
              {organization.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-gray-700 truncate">{organization.name}</p>
              <p className="text-xs text-gray-500 capitalize">{organization.storageProvider} Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="md:hidden bg-white border-b border-gray-200 flex items-center justify-between px-4 h-16 z-20">
           <div className="flex items-center">
            <Wallet className="w-6 h-6 text-blue-600 mr-2" />
            <span className="text-lg font-bold text-gray-800">BillFlow</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute inset-0 top-16 bg-white z-10 flex flex-col p-4 space-y-2 md:hidden">
            <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem view="verify" icon={FileCheck} label="Smart Verify" />
            <NavItem view="settings" icon={Settings} label="Settings" />
            <div className="pt-4 mt-4 border-t border-gray-100 flex items-center">
               <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                  {organization.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{organization.name}</p>
                </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};