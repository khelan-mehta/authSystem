import React from 'react';
import { Button } from "@/components/ui/button";
import { Shield, Lock, Fingerprint } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <div className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-950 py-20 px-4 sm:px-6 lg:px-8 text-white overflow-hidden">
      {/* Abstract security pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-blue-400"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 300 + 50}px`,
                height: `${Math.random() * 300 + 50}px`,
                opacity: Math.random() * 0.5,
                transform: `scale(${Math.random() * 0.6 + 0.4})`,
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between relative z-10">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <div className="flex items-center mb-6">
            <Shield className="h-10 w-10 text-blue-300 mr-3" />
            <h2 className="text-xl font-bold text-blue-300">SecureKYC Pro</h2>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
            AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-teal-300">Fraud Detection</span> & KYC Verification
          </h1>
          
          <p className="text-xl mb-8 text-blue-100">
            Secure your platform with military-grade identity verification. Our AI analyzes device fingerprints, MAC addresses, and biometrics to detect and prevent fraud in real-time.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={onGetStarted} 
              size="lg" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-6 text-lg font-semibold rounded-md flex items-center"
            >
              <Lock className="mr-2 h-5 w-5" />
              Secure Your Platform
            </Button>
            
            <button className="text-blue-300 hover:text-white px-8 py-6 text-lg font-semibold flex items-center transition-colors">
              <Fingerprint className="mr-2 h-5 w-5" />
              Learn How It Works
            </button>
          </div>
          
          <div className="mt-8 flex items-center">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-blue-400 border-2 border-indigo-900 flex items-center justify-center text-xs font-bold">
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <p className="ml-4 text-sm text-blue-300">
              Trusted by 10,000+ businesses worldwide
            </p>
          </div>
        </div>
        
        <div className="md:w-1/2 flex justify-center relative">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl blur-xl opacity-30 transform rotate-3"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-blue-950 p-2 rounded-xl shadow-2xl border border-blue-700/30 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="bg-gray-950 rounded-lg overflow-hidden p-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-xs text-blue-300">SecureKYC Dashboard</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-900/40 p-3 rounded-lg">
                    <div className="text-xs text-blue-400 mb-1">Verification Rate</div>
                    <div className="text-xl font-bold text-blue-100">98.7%</div>
                    <div className="h-2 w-full bg-blue-950 rounded-full mt-2">
                      <div className="h-full w-11/12 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-900/40 p-3 rounded-lg">
                    <div className="text-xs text-blue-400 mb-1">Fraud Detection</div>
                    <div className="text-xl font-bold text-blue-100">99.2%</div>
                    <div className="h-2 w-full bg-blue-950 rounded-full mt-2">
                      <div className="h-full w-11/12 bg-teal-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-900/20 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-blue-300">Latest Verifications</div>
                    <div className="text-xs text-blue-500">View All</div>
                  </div>
                  
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-blue-900/30 last:border-0">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-blue-700 mr-2 flex items-center justify-center text-xs">
                          {String.fromCharCode(85 + i)}
                        </div>
                        <div className="text-xs text-blue-100">{`User${67 + i}***${9 + i}`}</div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                        <div className="text-xs text-green-400">Verified</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-xs text-blue-500">
                  <div>MAC: A1:B2:C3:D4:**:**</div>
                  <div>Location: Secured</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;