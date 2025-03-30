import React from 'react';
import { 
  Shield, 
  Fingerprint, 
  Cog, 
  Globe, 
  Lock, 
  AlertTriangle,
  Layers,
  Zap,
  NetworkIcon,
  FileText,
  Database,
  Eye
} from "lucide-react";

const features = [
  { 
    title: "MAC Address Tracking", 
    description: "Uniquely identify devices through secure MAC address fingerprinting for enhanced fraud prevention.",
    icon: NetworkIcon,
    color: "from-blue-600 to-blue-400"
  },
  { 
    title: "AI Biometric Verification", 
    description: "Multi-layer facial recognition with liveness detection prevents spoofing attempts.",
    icon: Fingerprint,
    color: "from-indigo-600 to-indigo-400"
  },
  { 
    title: "Device Intelligence", 
    description: "Monitor user behavior patterns across devices to identify suspicious activities.",
    icon: Cog,
    color: "from-sky-600 to-sky-400"
  },
  { 
    title: "Geo-Location Verification", 
    description: "Compare IP addresses with physical location data to flag location discrepancies.",
    icon: Globe,
    color: "from-cyan-600 to-cyan-400"
  },
  { 
    title: "Real-time Alert System", 
    description: "Instant notifications for suspicious activities with configurable risk thresholds.",
    icon: AlertTriangle,
    color: "from-purple-600 to-purple-400"
  },
  { 
    title: "Multi-layered Encryption", 
    description: "Military-grade encryption of personal data and verification documents.",
    icon: Lock,
    color: "from-teal-600 to-teal-400"
  },
  { 
    title: "Document Authenticity Check", 
    description: "AI-powered verification of official documents with tamper detection capability.",
    icon: FileText,
    color: "from-green-600 to-green-400"
  },
  { 
    title: "Behavioral Analysis", 
    description: "AI detection of unusual user patterns that may indicate fraudulent activities.",
    icon: Eye,
    color: "from-red-600 to-red-400"
  },
  { 
    title: "Compliance & Reporting", 
    description: "Automatic generation of audit trails and compliance reports for regulatory requirements.",
    icon: Database,
    color: "from-amber-600 to-amber-400"
  }
];

const FeatureSection = () => {
  return (
    <div className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-full mb-4">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Military-Grade Security Features
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI-powered platform provides unparalleled security through hardware fingerprinting,
            biometric verification, and advanced behavioral analysis.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 relative overflow-hidden group"
            >
              <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
              
              <div className={`inline-flex items-center justify-center p-3 rounded-lg bg-gradient-to-r ${feature.color} mb-5`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                {feature.title}
              </h3>
              
              <p className="text-gray-600">
                {feature.description}
              </p>
              
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-xs text-gray-500">Active Protection</span>
                </div>
                <span className="text-xs text-blue-600 font-medium cursor-pointer hover:text-blue-800 transition-colors">
                  Learn more →
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 md:p-12 flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-8 md:mb-0 md:pr-8">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Enterprise-Grade Security For Everyone
              </h3>
              <p className="text-blue-100 mb-6">
                Join thousands of businesses that trust our platform for secure KYC processing and fraud prevention.
                Our system processes over 1 million verifications daily with 99.9% accuracy.
              </p>
              <div className="flex space-x-4">
                <button className="bg-white text-blue-900 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center">
                  <Zap className="mr-2 h-5 w-5" />
                  Get Started
                </button>
                <button className="bg-transparent border border-blue-300 text-blue-100 hover:bg-blue-800/30 px-6 py-3 rounded-lg font-semibold transition-colors">
                  Request Demo
                </button>
              </div>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-30"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl">
                  <div className="flex items-center justify-center mb-4">
                    <Layers className="h-12 w-12 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-1">99.9%</div>
                    <div className="text-sm text-blue-200">Fraud Detection Rate</div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-blue-400/30">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-200">MAC Verification</span>
                      <span className="text-white font-bold">100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureSection;