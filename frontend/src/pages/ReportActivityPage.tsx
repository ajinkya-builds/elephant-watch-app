import React, { useState } from 'react';
import { ActivityReportStepper } from "@/components/ActivityReportStepper";
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { useAuth } from '@/contexts/NewAuthContext';
import { ActivityReport } from '@/types/activity-report';
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";


const ReportActivityPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, loading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  // Check authentication status
  React.useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate('/login');
    }
  }, [user, isAuthLoading, navigate]);

  if (isAuthLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const handleSubmit = async (reportData: Partial<ActivityReport>) => {
    setIsSubmitting(true);
    try {
      const { error: insertError } = await supabase
        .from('activity_reports')
        .insert([reportData]);

      if (insertError) throw insertError;

      toast.success('Activity report submitted successfully');
      navigate('/activities');
    } catch (err) {
      console.error('Error submitting report:', err);
      toast.error('Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-2 sm:p-4">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Wild Elephant Monitoring System
          </h1>
          <h2 className="mt-2 text-2xl font-semibold text-gray-600">
            जंगली हाथी निगरानी प्रणाली (2025)
          </h2>
        </header>



        <Card className="mb-8 overflow-hidden border border-blue-100 bg-white shadow-sm">
          <div className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">निर्देश / Instructions:</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>
                      इस फॉर्म को चार चरणों में पूरा करें: तारीख/समय और स्थान, अवलोकन का प्रकार, कम्पास बेयरिंग, और फोटो।
                      <br />
                      <span className="text-gray-500">Complete this form in four steps: Date/Time & Location, Type of Observation, Compass Bearing, and Photo.</span>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>
                      प्रत्येक चरण में आवश्यक जानकारी भरें और 'Next' बटन पर क्लिक करें। पिछले चरण पर जाने के लिए 'Previous' बटन का उपयोग करें।
                      <br />
                      <span className="text-gray-500">Fill in the required information in each step and click 'Next'. Use 'Previous' to go back to earlier steps.</span>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>
                      GPS लोकेशन को Degree Decimal फॉर्मेट में भरें (उदाहरण: 23.4536 81.4763)। सटीक स्थान महत्वपूर्ण है।
                      <br />
                      <span className="text-gray-500">Enter GPS location in Degree Decimal format (Example: 23.4536 81.4763). Accurate location is crucial.</span>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>
                      अवलोकन के प्रकार के अनुसार, हाथियों की संख्या या अप्रत्यक्ष साक्ष्य का विवरण दें।
                      <br />
                      <span className="text-gray-500">Based on observation type, provide elephant count or indirect evidence details.</span>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        <main className="max-w-4xl mx-auto">
          <ActivityReportStepper onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </main>
      </div>
    </div>
  );
};

export default ReportActivityPage;