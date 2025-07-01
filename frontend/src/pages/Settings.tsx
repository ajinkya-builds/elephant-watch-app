import React, { useState } from 'react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '../components/ui/breadcrumb';
import { useAndroidTheme } from '../theme/AndroidThemeProvider';

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
];

export default function SettingsPage() {
  const { theme, toggleDarkMode } = useAndroidTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState('en');
  const [privacyMode, setPrivacyMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [dataSaver, setDataSaver] = useState(false);

  const handleReset = () => {
    setNotificationsEnabled(true);
    setLanguage('en');
    setPrivacyMode(false);
    setCompactMode(false);
    setDataSaver(false);
    if (theme.isDark) toggleDarkMode();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mt-8">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#/user-profile">User Profile</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-2xl font-semibold mb-6">Settings</h1>
        <form className="space-y-6">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-base">Dark Mode</span>
            <button
              type="button"
              className={`px-4 py-2 rounded transition ${theme.isDark ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              onClick={toggleDarkMode}
            >
              {theme.isDark ? 'Disable' : 'Enable'}
            </button>
          </div>
          {/* Notification Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-base">Enable Notifications</span>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={() => setNotificationsEnabled(v => !v)}
              className="w-5 h-5 accent-blue-600"
            />
          </div>
          {/* Language Selection */}
          <div className="flex items-center justify-between">
            <span className="text-base">Language</span>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="px-3 py-2 border rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {LANGUAGE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {/* Privacy Mode */}
          <div className="flex items-center justify-between">
            <span className="text-base">Privacy Mode</span>
            <input
              type="checkbox"
              checked={privacyMode}
              onChange={() => setPrivacyMode(v => !v)}
              className="w-5 h-5 accent-blue-600"
            />
          </div>
          {/* Compact Mode */}
          <div className="flex items-center justify-between">
            <span className="text-base">Compact Mode</span>
            <input
              type="checkbox"
              checked={compactMode}
              onChange={() => setCompactMode(v => !v)}
              className="w-5 h-5 accent-blue-600"
            />
          </div>
          {/* Data Saver Mode */}
          <div className="flex items-center justify-between">
            <span className="text-base">Data Saver Mode</span>
            <input
              type="checkbox"
              checked={dataSaver}
              onChange={() => setDataSaver(v => !v)}
              className="w-5 h-5 accent-blue-600"
            />
          </div>
          {/* Reset to Defaults */}
          <div className="flex items-center justify-center pt-4">
            <button
              type="button"
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              onClick={handleReset}
            >
              Reset to Defaults
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 