import React from 'react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '../components/ui/breadcrumb';

export default function PrivacyPage() {
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
              <BreadcrumbPage>Privacy & Security</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-2xl font-semibold mb-6">Privacy & Security</h1>
        {/* Data Privacy Section */}
        <section className="mb-6">
          <h2 className="text-lg font-medium mb-2">Data Privacy</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Your personal data is stored securely and is never shared with third parties without your consent. You can review and update your profile information at any time.
          </p>
        </section>
        {/* Security Tips Section */}
        <section className="mb-6">
          <h2 className="text-lg font-medium mb-2">Security Tips</h2>
          <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
            <li>Use a strong, unique password for your account.</li>
            <li>Never share your login credentials with anyone.</li>
            <li>Enable two-factor authentication if available.</li>
            <li>Log out from shared or public devices after use.</li>
          </ul>
        </section>
        {/* Manage Account Section */}
        <section className="mb-6">
          <h2 className="text-lg font-medium mb-2">Manage Account</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            You can request to delete your account and all associated data. This action is irreversible.
          </p>
          <button
            type="button"
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            onClick={() => alert('Account deletion request submitted (demo only).')}
          >
            Request Account Deletion
          </button>
        </section>
      </div>
    </div>
  );
} 