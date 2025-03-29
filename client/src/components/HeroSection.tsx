
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <div className="relative bg-gradient-to-b from-purple-700 to-indigo-900 py-20 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
            AI-Powered Product Catalogue Generator
          </h1>
          <p className="text-xl mb-8 text-purple-100">
            Transform your product images into professional catalogues in seconds with our AI technology.
            Upload an image, and our AI will create stunning catalogue layouts with product descriptions.
          </p>
          <Button 
            onClick={onGetStarted} 
            size="lg" 
            className="bg-white text-purple-900 hover:bg-purple-100 px-8 py-6 text-lg font-semibold rounded-md">
            Get Started
          </Button>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <img 
            src="/placeholder.svg" 
            alt="Catalogue Generation Example" 
            className="w-full max-w-md rounded-lg shadow-2xl transform rotate-2 hover:rotate-0 transition-all duration-300"
          />
        </div>
      </div>
      
      
    </div>
  );
};

export default HeroSection;
