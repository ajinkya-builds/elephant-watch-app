import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Elephant } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 p-4">
      <div className="text-center bg-white p-8 sm:p-12 rounded-xl shadow-2xl max-w-xl">
        <Elephant className="w-20 h-20 text-green-600 mx-auto mb-6" />
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-800">Elephant Watch</h1>
        <p className="text-lg text-gray-600 mb-8">
          Report elephant activity to help conservation efforts. Your observations matter!
        </p>
        <Link to="/report-activity">
          <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-6 rounded-lg shadow-md transition-transform hover:scale-105">
            Report New Activity
          </Button>
        </Link>
        <p className="text-sm text-gray-500 mt-10">
          Together, we can make a difference for these magnificent animals.
        </p>
      </div>
    </div>
  );
};

export default Index;