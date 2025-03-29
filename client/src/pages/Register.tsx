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
        navigate("/dashboard");
      }
    } catch (error) {
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 to-indigo-200 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6">
        <div className="space-y-1 mb-6">
          <h1 className="text-3xl font-bold text-center text-indigo-900">
            Register
          </h1>
          <p className="text-center text-gray-600">Create your account</p>
        </div>

        <div className="space-y-6">
          {/* Username */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={handleChange}
              placeholder="Enter your username"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example12@gmail.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Password */}
          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Device ID Display */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Your Device ID
            </label>
            <div className="relative">
              <div className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-between">
                <span className="text-gray-600 text-sm truncate max-w-[85%]">
                  {deviceId || "Generating device identifier..."}
                </span>
                {deviceId && (
                  <button
                    onClick={() => navigator.clipboard.writeText(deviceId)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm transition-colors"
                    title="Copy Device ID"
                  >
                    Copy
                  </button>
                )}
              </div>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"></div>
            </div>
            <p className="text-xs text-gray-500">
              This unique identifier helps secure your account
            </p>
          </div>

          {/* Register Button */}
          <button
            onClick={handleRegister}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            disabled={!deviceId} // Disable button until deviceId is generated
          >
            Register
          </button>

          {/* Login Link */}
          <p className="text-center text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-indigo-600 hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
