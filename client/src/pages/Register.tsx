"use client"; // This ensures it's a client-side component

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft, RefreshCcw, X } from "lucide-react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import InputWithIcon from "@/components/InputWithIcon";
import { TransitionLink } from "@/components/TransitionLink";
import axios from "axios";
import CryptoJS from "crypto-js";
import { MessageBox } from "@/components/MessageBox";
import { setSession } from "../lib/session";
import { useNavigate } from "react-router-dom";
import { BASE_URL, CryptoSecret } from "../env";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); 
  const [university, setUniversity] = useState("");
  const [password, setPassword] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [deviceId, setDeviceId] = useState(""); // Add state for deviceId
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [avatarBox, setAvatarBox] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(
    "https://api.multiavatar.com/default.svg"
  );
  const [defaultAvatars, setDefaultAvatars] = useState<string[]>([]);
  const [generated, setGenerated] = useState(false);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Initialize FingerprintJS and get device ID
  useEffect(() => {
    const initializeFingerprint = async () => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        setDeviceId(result.visitorId); // Set the unique device identifier
      } catch (error) {
        console.error("Error getting fingerprint:", error);
        // Fallback: generate a random ID if fingerprint fails
        setDeviceId(Math.random().toString(36).substring(2));
      }
    };

    initializeFingerprint();

    const searchParams = new URLSearchParams(window.location.search);
    const token = localStorage.getItem("access_token");
    if (token) {
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate("/dashboard");
    }
    const emails = searchParams.get("email");
    console.log(searchParams);
    setEmail(emails);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const [messageBox, setMessageBox] = useState({
    type: "",
    message: "",
    isVisible: false,
  });

  const handleRegister = async () => {
    if (!validateEmail(email)) {
      alert("Invalid email format!");
      return;
    }

    if (!validatePassword(password)) {
      alert(
        "Password must be at least 8 characters long, contain at least one uppercase letter and one number."
      );
      return;
    }

    if (!deviceId) {
      alert("Device identification failed. Please try again.");
      return;
    }

    try {
      const encryptedPassword = CryptoJS.AES.encrypt(
        password,
        CryptoSecret
      ).toString();

      const response = await axios.post(`${BASE_URL}/api/auth/register`, {
        email,
        password: encryptedPassword,
        username,
        bankAccount,
        deviceId, // Include deviceId in the registration request
      });

      const message = response.data.message;

      // Handle duplicate deviceId error
      if (
        message.includes("E11000 duplicate key error") &&
        message.includes("deviceId")
      ) {
        alert("This device is already registered. Please log in instead.");
        return;
      }

      if (message.includes("Email is already in use")) {
        alert("Email is already in use. Please use a different email.");
      } else if (message.includes("Username is already in use")) {
        alert(
          "Username is already in use. Please choose a different username."
        );
      } else {
        const { accessToken, userId } = response.data;
        setSession("access_token", accessToken);
        setSession("userId", userId);
        setSession("deviceId", deviceId);

        alert(response.data.message);
        navigate("/login");
      }
    } catch (error) {
      alert("Registration failed. Please try again.");
    }
  };

  return (
    // Ensure client-side rendering for animations

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 p-6">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-xl shadow-2xl p-8"
      >
        <div className="space-y-3 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex justify-center mb-4"
          >
            <svg
              className="w-12 h-12 text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 11c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              />
            </svg>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-4xl font-bold text-white tracking-tight"
          >
            Create Account
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-gray-400 text-base"
          >
            Join our AI-powered blockchain banking platform
          </motion.p>
        </div>

        <div className="space-y-6 mt-6">
          {/* Username */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-gray-300">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={handleChange}
                placeholder="Enter your username"
                className="w-full bg-gray-800 border-gray-700 text-white placeholder-gray-500 rounded-lg py-3 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </motion.div>

          {/* Email */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-gray-300">
              Email Address
            </label>
            <div className="relative">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@domain.com"
                className="w-full bg-gray-800 border-gray-700 text-white placeholder-gray-500 rounded-lg py-3 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </motion.div>

          {/* Password */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="space-y-2 relative"
          >
            <label className="text-sm font-medium text-gray-300">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-gray-800 border-gray-700 text-white placeholder-gray-500 rounded-lg py-3 pl-10 pr-12 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                />
              </svg>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
              >
                {showPassword ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.42 0-8-3.58-8-8s3.58-8 8-8c1.68 0 3.24.52 4.52 1.41M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.42 0-8-3.58-8-8s3.58-8 8-8c1.68 0 3.24.52 4.52 1.41M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 4.42-3.58 8-8 8M3 3l18 18"
                    />
                  </svg>
                )}
              </button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="space-y-2 relative"
          >
            <label className="text-sm font-medium text-gray-300">
              Bank Account Number (10 Digit Number)
            </label>
            <div className="relative">
              <input
                type={"text"}
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="Enter your Bank Account Number (10 Digit Number)"
                className="w-full bg-gray-800 border-gray-700 text-white placeholder-gray-500 rounded-lg py-3 pl-10 pr-12 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                />
              </svg>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
              >
                {showPassword ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.42 0-8-3.58-8-8s3.58-8 8-8c1.68 0 3.24.52 4.52 1.41M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.42 0-8-3.58-8-8s3.58-8 8-8c1.68 0 3.24.52 4.52 1.41M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 4.42-3.58 8-8 8M3 3l18 18"
                    />
                  </svg>
                )}
              </button>
            </div>
          </motion.div>

          {/* Device ID Display */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-gray-300">
              Your Device ID
            </label>
            <div className="relative">
              <div className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-between">
                <span className="text-gray-400 text-sm truncate max-w-[85%]">
                  {deviceId || "Generating device identifier..."}
                </span>
                {deviceId && (
                  <button
                    onClick={() => navigator.clipboard.writeText(deviceId)}
                    className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                    title="Copy Device ID"
                  >
                    Copy
                  </button>
                )}
              </div>
              
            </div>
            <p className="text-xs text-gray-500">Enhances account security</p>
          </motion.div>

          {/* Register Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.9 }}
            onClick={handleRegister}
            className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            disabled={!deviceId}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Register
          </motion.button>

          {/* Login Link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1 }}
            className="text-center text-sm text-gray-400"
          >
            Already have an account?{" "}
            <a
              href="/login"
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Sign In
            </a>
          </motion.p>

          {/* Footer Branding */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.1 }}
            className="flex justify-center gap-4 text-gray-500 text-xs mt-4"
          >
            <span className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                />
              </svg>
              AI-Powered
            </span>
            <span className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              Blockchain
            </span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
