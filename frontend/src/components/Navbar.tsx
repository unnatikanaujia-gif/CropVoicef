import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Sprout,
  Mic,
  TrendingUp,
  CloudSun,
  ShieldAlert,
  Landmark,
  Settings,
  Menu,
  X,
  Languages,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageCode } from '../types/api';
import { BackendStatusBadge } from './BackendStatusBadge';

export const Navbar: React.FC = () => {
  const { language, setLanguage, t, languages } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/', label: t.home, icon: Sprout },
    { to: '/chat', label: t.chatAssistant, icon: Mic },
    { to: '/mandi', label: t.mandiPrices, icon: TrendingUp },
    { to: '/weather', label: t.weather, icon: CloudSun },
    { to: '/consultancy', label: t.cropDoctor, icon: ShieldAlert },
    { to: '/schemes', label: t.schemes, icon: Landmark },
    { to: '/settings', label: t.settings, icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-stone-900 group-hover:text-emerald-700 transition-colors">
                  CropVoice
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  India
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden md:block">
                Voice Assistant for Indian Farmers
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 font-semibold'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Controls: Backend Status & Language Selector */}
          <div className="hidden sm:flex items-center gap-3">
            <BackendStatusBadge />

            {/* Language Selector */}
            <div className="relative inline-flex items-center">
              <Languages className="w-4 h-4 text-stone-400 absolute left-2.5 pointer-events-none" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                className="pl-8 pr-8 py-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg text-stone-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors appearance-none"
                aria-label="Select Interface Language"
              >
                {Object.values(languages).map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName} ({lang.label})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2 text-stone-500 text-[10px]">
                ▼
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="hidden sm:block">
              <BackendStatusBadge />
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <BackendStatusBadge showDetails />
            <div className="relative inline-flex items-center">
              <Languages className="w-4 h-4 text-stone-400 absolute left-2 pointer-events-none" />
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value as LanguageCode);
                }}
                className="pl-7 pr-6 py-1 text-xs font-semibold bg-stone-100 border border-stone-300 rounded-md text-stone-800 appearance-none"
              >
                {Object.values(languages).map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 font-bold'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 text-emerald-600" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
