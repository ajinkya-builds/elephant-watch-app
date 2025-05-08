import { ReportForm } from "@/components/ReportForm";

const ReportActivityPage = () => {
  return (
    <div className="container mx-auto py-10 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Report Elephant Activity</h1>
        <p className="text-muted-foreground">
          Help us track and protect elephant populations by reporting your observations.
        </p>
      </header>
      <main className="max-w-2xl mx-auto bg-card p-6 sm:p-8 rounded-lg shadow">
        <ReportForm />
      </main>
    </div>
  );
};

export default ReportActivityPage;