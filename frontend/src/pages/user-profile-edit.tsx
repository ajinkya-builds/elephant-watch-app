import React, { useState } from 'react';
import { useAuth } from '../contexts/NewAuthContext';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '../components/ui/breadcrumb';
import { useNavigate } from 'react-router-dom';

export default function UserProfileEditPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Prefill form fields with current user data
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [role] = useState(user?.role || '');
  const [position] = useState(user?.position || '');

  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsEditing(true);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsEditing(false);
    // TODO: Implement backend update logic here
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
              <BreadcrumbPage>Edit Profile</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Edit Profile</h1>
          {!isEditing ? (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              onClick={handleEdit}
            >
              Edit
            </button>
          ) : (
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              onClick={handleSave}
            >
              Save
            </button>
          )}
        </div>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              readOnly={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              readOnly={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded bg-gray-100 dark:bg-gray-700"
              value={email}
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              className="w-full px-3 py-2 border rounded"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              readOnly={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded bg-gray-100 dark:bg-gray-700"
              value={role}
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Position</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded bg-gray-100 dark:bg-gray-700"
              value={position}
              disabled
            />
          </div>
        </form>
      </div>
    </div>
  );
} 