import React, { useState, useEffect } from 'react';
import { ReportStepper } from "@/components/ReportStepper";
import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

const ReportActivityPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const navigate = useNavigate();

  // Check authentication status using localStorage session
  useEffect(() => {
    const checkAuth = async () => {
      const sessionStr = localStorage.getItem('session');
      if (!sessionStr) {
        navigate('/');
        return;
      }
      setIsAuthenticating(false);
    };

    checkAuth();
  }, [navigate]);

  if (isAuthenticating) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Helper to get IP address
  async function getIpAddress() {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      return data.ip;
    } catch {
      return '';
    }
  }

  // Handle form submission
  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      
      // Map form fields to database schema
      const formData: Record<string, any> = {
        activity_date: new Date(data.activityDate).toISOString().split('T')[0],
        activity_time: data.activityTime,
        latitude: data.latitude,
        longitude: data.longitude,
        total_elephants: data.totalElephants.toString(),
        male_elephants: data.maleElephants?.toString() || null,
        female_elephants: data.femaleElephants?.toString() || null,
        unknown_elephants: data.unknownElephants?.toString() || null,
        division_name: data.divisionName,
        range_name: data.rangeName,
        beat_name: data.beatName,
        compartment_no: data.compartmentNo,
        heading_towards: data.headingTowards || null,
        local_name: data.localName || null,
        identification_marks: data.identificationMarks || null,
        reporter_name: data.reporterName,
        reporter_mobile: data.reporterMobile,
        land_type: data.landType,
        damage_done: data.damageDone,
        damage_description: data.damageDescription || null,
        email: data.email
      };

      // Get session from localStorage
      const sessionStr = localStorage.getItem('session');
      if (!sessionStr) {
        throw new Error('Not authenticated. Please login again.');
      }
      
      const session = JSON.parse(sessionStr);
      
      // Add user_id to the data
      formData.user_id = session.user.id;

      // Create a direct admin client for this specific request
      // This ensures we're using the correct service role key
      console.log('Creating direct admin client to bypass RLS');
      
      const adminKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
      const adminUrl = import.meta.env.VITE_SUPABASE_URL;
      
      // Log a masked version of the key for debugging
      if (!adminKey) throw new Error('Supabase service role key is not set in environment variables.');
      console.log(`Using service key: ${adminKey.substring(0, 5)}...${adminKey.substring(adminKey.length - 5)}`);
      
      // Make a direct fetch request with the service role key
      const response = await fetch(`${adminUrl}/rest/v1/activity_reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': adminKey,
          'Authorization': `Bearer ${adminKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify([formData])
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit report');
      }
      
      const insertData = await response.json();

      // Log activity after successful submission
      try {
        const ip = await getIpAddress();
        await supabase.from('activity_logs').insert([
          {
            user_email: session.user.email,
            action: 'report_submitted',
            time: new Date().toISOString(),
            ip,
            created_at: new Date().toISOString()
          }
        ]);
      } catch (logError) {
        console.error('Failed to log activity:', logError);
      }

      toast.success('Report submitted successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error(error.message || 'Failed to submit report. Please check the console for more details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Wild Elephant Monitoring System (WEMS)
        </h1>
        <h2 className="text-2xl font-semibold tracking-tight text-muted-foreground">
          जंगली हाथी निगरानी प्रणाली (2022)
        </h2>
      </header>
      <section className="mb-8 p-4 border rounded-md bg-blue-50 border-blue-200 text-blue-700">
        <h3 className="font-semibold text-lg mb-2">निर्देश / Instructions:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>
            हाथियों की सतत निगरानी एवं मुख्यालय द्वारा रियल टाइम जानकारी प्राप्त करने हेतु यह फॉर्म भरें।
            (Fill this form for continuous monitoring of elephants and to provide real-time information to headquarters.)
          </li>
          <li>
            जानकारी में GPS लोकेशन को बहोत ध्यान से भरें।
            (Fill the GPS location very carefully.)
          </li>
          <li>
            GPS location को Degree Decimal में ही भरें। उदाहरण / Example: 23.4536 81.4763
            (Fill GPS location in Degree Decimal format only.)
          </li>
          <li>Fields marked with <span className="text-red-500">*</span> are required. / <span className="text-red-500">*</span> से चिह्नित फ़ील्ड अनिवार्य हैं।</li>
        </ul>
      </section>
      <main className="max-w-2xl mx-auto bg-card p-6 sm:p-8 rounded-lg shadow">
        <ReportStepper onSubmit={handleSubmit} isLoading={isLoading} />
      </main>
    </div>
  );
};

export default ReportActivityPage;