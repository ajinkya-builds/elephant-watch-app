import React, { useState } from 'react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '../components/ui/breadcrumb';

export default function HelpPage() {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFeedback('');
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
              <BreadcrumbPage>Help & Support</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-2xl font-semibold mb-6">Help & Support</h1>
        {/* FAQ Section */}
        <section className="mb-6">
          <h2 className="text-lg font-medium mb-2">Frequently Asked Questions</h2>
          <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
            <li><strong>How do I reset my password?</strong> <br />Go to the login page and click on "Forgot Password" to receive a reset link.</li>
            <li><strong>How do I update my profile?</strong> <br />Navigate to User Profile &gt; Edit Profile to update your information.</li>
            <li><strong>How do I contact support?</strong> <br />See the contact section below for support details.</li>
          </ul>
        </section>
        {/* Contact Support Section */}
        <section className="mb-6">
          <h2 className="text-lg font-medium mb-2">Contact Support</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            If you need further assistance, please email us at <a href="mailto:support@elephantwatch.com" className="text-blue-600 underline">support@elephantwatch.com</a> or call <a href="tel:+1800123456" className="text-blue-600 underline">+1 800 123 456</a>.
          </p>
        </section>
        {/* Feedback Form Section */}
        <section className="mb-2">
          <h2 className="text-lg font-medium mb-2">Send Feedback</h2>
          {submitted ? (
            <div className="text-green-600 mb-2">Thank you for your feedback!</div>
          ) : null}
          <form onSubmit={handleFeedbackSubmit} className="flex flex-col gap-2">
            <textarea
              className="w-full px-3 py-2 border rounded resize-none min-h-[80px]"
              placeholder="Your feedback..."
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              required
            />
            <button
              type="submit"
              className="self-end px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              disabled={!feedback.trim()}
            >
              Submit
            </button>
          </form>
        </section>
      </div>
    </div>
  );
} 