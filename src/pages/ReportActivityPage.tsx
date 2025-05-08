import { ReportForm } from "@/components/ReportForm";

const ReportActivityPage = () => {
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
        <ReportForm />
      </main>
    </div>
  );
};

export default ReportActivityPage;