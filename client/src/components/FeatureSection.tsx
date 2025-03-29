
import { CheckCircle } from "lucide-react";

const features = [
  {
    title: "AI-Powered Descriptions",
    description: "Our advanced AI generates accurate product descriptions from your images."
  },
  {
    title: "Automatic Background Removal",
    description: "Clean product images with automatic background removal."
  },
  {
    title: "Beautiful Templates",
    description: "Choose from various professionally designed catalogue templates."
  },
  {
    title: "Product Advantages",
    description: "AI identifies and highlights key selling points of your products."
  },
  {
    title: "PDF Generation",
    description: "Download your finished catalogue as a print-ready PDF."
  },
  {
    title: "Cloud Storage",
    description: "All your catalogues are securely stored and accessible anytime."
  }
];

const FeatureSection = () => {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Features Designed for Efficiency
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI-powered platform streamlines your catalogue creation process from start to finish.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start mb-4">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0 mt-1" />
                <h3 className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureSection;
