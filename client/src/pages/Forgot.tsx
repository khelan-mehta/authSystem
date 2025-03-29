"use client";

import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import InputWithIcon from "@/components/InputWithIcon";
import { setSession } from "../lib/session";
import CryptoJS from "crypto-js";
import { BASE_URL, CryptoSecret } from "../env";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentStep, setCurrentStep] = useState(1); // Step 1: Enter Email
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle "Forgot Password" Step 1 (Send OTP)
  const handleSendOtp = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post(
        `${BASE_URL}/api/auth/forgot-password`,
        { email }
      );
      if (response.data.message) {
        // Move to Step 2
        setCurrentStep(2);
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: Verify OTP
  const handleVerifyOtp = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post(`${BASE_URL}/api/auth/verify-otp`, {
        email,
        otp,
      });
      if (response.data.message) {
        // Move to Step 3
        setCurrentStep(3);
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 3: Reset Password
  const handleResetPassword = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      // Step 1: Reset Password
      const resetResponse = await axios.post(
        `${BASE_URL}/api/auth/reset-password`,
        {
          email,
          newPassword,
        }
      );
      console.log(resetResponse.data);

      if (resetResponse.data) {
        console.log("hit");

        // Step 2: Automatically Login
        const encryptedPassword = CryptoJS.AES.encrypt(
          newPassword,
          CryptoSecret
        ).toString();
        console.log(encryptedPassword);

        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
          email,
          password: encryptedPassword, // Send the encrypted password
        });

        // Step 3: Store session tokens
        setSession("access_token", loginResponse.data.access_token);
        setSession("userId", loginResponse.data.userId);

        // Step 4: Redirect to dashboard
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Password reset or login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-blue-100 to-indigo-200 p-4">
      <div className="flex flex-col items-center">
        {/* Header Image and Title */}
        

        {/* Forgot Password Text */}
        <p className="text-2xl font-bold text-indigo-900 text-center mb-6">
          FORGOT YOUR PASSWORD?
        </p>

        {/* Form Container */}
        <div className="w-full max-w-sm bg-white rounded-lg shadow-xl p-6">
          {errorMessage && (
            <p className="text-red-500 text-sm mb-4 text-center">
              {errorMessage}
            </p>
          )}

          {/* Step 1: Enter Email */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="text"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your Email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                disabled={loading}
                onClick={handleSendOtp}
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </div>
          )}

          {/* Step 2: Enter OTP */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">OTP</label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter the OTP sent to your email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                disabled={loading}
                onClick={handleVerifyOtp}
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {loading ? "Verifying OTP..." : "Verify OTP"}
              </button>
            </div>
          )}

          {/* Step 3: Reset Password */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                disabled={loading}
                onClick={handleResetPassword}
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
