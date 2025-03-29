"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import CryptoJS from "crypto-js";

import { BASE_URL, CryptoSecret } from "@/env";
import { setSession } from "@/lib/session";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [deviceId, setDeviceId] = useState(""); // Store deviceId
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(""); // OTP input
  const [showOtpInput, setShowOtpInput] = useState(false);

  const navigate = useNavigate();

  // Fetch deviceId using FingerprintJS
  useEffect(() => {
    const fetchDeviceId = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setDeviceId(result.visitorId);
    };
    fetchDeviceId();
  }, []);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const encryptedPassword = CryptoJS.AES.encrypt(
        password,
        CryptoSecret
      ).toString();
      const response = await axios.post(`${BASE_URL}/api/auth/login`, {
        email,
        password: encryptedPassword,
        deviceId, // Send deviceId
      });

      if (response.data.loggedIn === false) {
        // If device is new, show OTP input
        setShowOtpInput(true);
      } else {
        // Login successful, save session and navigate
        setSession("access_token", response.data.access_token);
        setSession("userId", response.data.userId);
        navigate("/dashboard");
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Verification
  const handleOtpVerification = async () => {
    if (!otp) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/auth/verify-otp-device`,
        {
          email,
          otp,
          deviceId, // Send deviceId for storage after OTP verification
        }
      );

      setSession("access_token", response.data.access_token);
      setSession("userId", response.data.userId);
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-red-100 to-red-200 p-4">
      <Card className="w-full max-w-md shadow-xl bg-white rounded-lg p-6">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-red-900">
            Sign In
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {errorMessage && (
              <p className="text-red-500 text-sm text-center">{errorMessage}</p>
            )}

            {!showOtpInput ? (
              <>
                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-2 relative">
                  <div className="flex justify-between w-full">
                    <Label htmlFor="password">Password</Label>
                    <p className="text-sm">
                      Forgot Password?{" "}
                      <a href="/forgot" className="text-red-600">
                        Reset
                      </a>
                    </p>
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-10 text-sm text-red-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* OTP Input */}
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter the OTP sent to your email"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <div className="flex w-full gap-4">
              {!showOtpInput ? (
                <>
                  {/* Google Login */}
                  <button
                    onClick={() =>
                      (window.location.href = `${BASE_URL}/api/auth/google/login`)
                    }
                    className="bg-[#181818] flex items-center justify-center border border-white text-white rounded-lg p-2"
                  >
                    <img
                      src="google.png"
                      alt="Google Login"
                      className="h-6 w-6"
                    />
                  </button>

                  {/* Login Button */}
                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </>
              ) : (
                <>
                  {/* Verify OTP Button */}
                  <Button
                    onClick={handleOtpVerification}
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </Button>
                </>
              )}
            </div>

            <p className="text-center text-sm">
              Don’t have an account?{" "}
              <a href="/register" className="text-red-600">
                Register
              </a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
