"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  AlertTriangle,
  Badge,
  ShieldX,
  ShieldAlert,
  DollarSign,
} from "lucide-react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getSession, setSession } from "@/lib/session";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import TransactionsTab from "@/components/TransactionsTab";

const clearFilters = {
  transactionId: "",
  date: "",
  senderAccount: "",
  receiverAccount: "",
  amountMin: "",
  amountMax: "",
  paymentType: "",
  isLaundering: "",
};

const riskIcons = {
  Low: <ShieldX className="w-4 h-4 text-blue-400" />,
  Medium: <ShieldAlert className="w-4 h-4 text-yellow-400" />,
  High: <AlertTriangle className="w-4 h-4 text-red-500" />,
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("settings");
  const [activeTab2, setActiveTab2] = useState("Fraudulent Transactions");
  const [transactions, setTransactions] = useState([]);
  const [launderingCategories, setLaunderingCategories] = useState({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const navigate = useNavigate();
  const [filters, setFilters] = useState(clearFilters);
  const [flaggedUsers, setFlaggedUsers] = useState([]);
  const [sortedUsers, setSortedUsers] = useState(flaggedUsers);
  const [sortOrder, setSortOrder] = useState("asc");
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("access_token");

      if (!userId) {
        setError("User not logged in.");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3001/api/auth/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser(response.data.user);
        if (response.data.user?.isKycVerified === false) {
          navigate("/kyc");
        }
        localStorage.setItem("access_token", response.data.newAccessToken);
      } catch (err) {
        setError("Failed to fetch user data");
        navigate("/login");
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("access_token");
    const userId = queryParams.get("userId");
    const encodedDeviceIds = queryParams.get("deviceIds");

    // Only execute if access_token and userId are present
    if (!token || !userId) return;

    const checkFingerprint = async () => {
      try {
        // Generate device fingerprint
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const fingerprint = result.visitorId;

        // Decode and parse deviceIds from the URL
        let deviceIdArray: string[] = [];
        if (encodedDeviceIds) {
          try {
            deviceIdArray = JSON.parse(decodeURIComponent(encodedDeviceIds));
          } catch (error) {
            console.error("Error parsing deviceIds:", error);
          }
        }

        console.log("Generated Fingerprint:", fingerprint);
        console.log("Allowed Device IDs:", deviceIdArray);

        // Check if the fingerprint exists in the deviceIdArray
        if (deviceIdArray.includes(fingerprint)) {
          // Fingerprint is registered, proceed with login
          setSession("access_token", token);
          setSession("userId", userId);

          setTimeout(() => {
            const accessToken = getSession("access_token");
            if (!accessToken) {
              navigate("/login");
            } else {
              setTimeout(() => {
                navigate("/dashboard");
              }, 1000);
            }
          }, 100);
        } else {
          // Fingerprint not found, redirect to login with error message
          toast({
            title: "Unauthorized",
            description:
              "Device not registered. Kindly log in to add this device.",
          });
          navigate("/login");
        }
      } catch (error) {
        console.error("Fingerprint generation error:", error);
      }
    };

    checkFingerprint();
  }, [navigate]);

  const sortByRisk = () => {
    const sorted = [...sortedUsers].sort((a, b) => {
      const riskLevels = { Low: 1, Medium: 2, High: 3 };
      return sortOrder === "asc"
        ? riskLevels[a.riskLevel] - riskLevels[b.riskLevel]
        : riskLevels[b.riskLevel] - riskLevels[a.riskLevel];
    });

    setSortedUsers(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const applyFilters = async () => {
    const params = new URLSearchParams(filters as any).toString();
    const res = await fetch(
      `http://localhost:3001/api/transactions/search?${params}`
    );
    const data = await res.json();
    setTransactions(data);
  };

  useEffect(() => {
    fetch("http://localhost:3001/api/transactions/flagged-users")
      .then((res) => res.json())
      .then((data) => setFlaggedUsers(data));
  }, []);

  const riskColors = {
    High: "bg-red-600 text-white",
    Medium: "bg-yellow-500 text-white",
    Low: "bg-green-600 text-white",
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/transactions`,
        {
          params: { page, limit },
        }
      );
      setTransactions(response.data.transactions);
      setTotal(response.data.total);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  // Fetch categorized laundering transactions
  const fetchLaunderingCategories = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/transactions/laundering/categories`
      );
      setLaunderingCategories(response.data);
    } catch (error) {
      console.error("Error fetching laundering categories:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "admin") {
      fetchTransactions();
      fetchLaunderingCategories();
    }
  }, [activeTab, page]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("userId");

    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/login");
  };

  const [fraudData, setFraudData] = useState<
    { date: string; amount: number }[]
  >([]);
  const [totalFraudAmount, setTotalFraudAmount] = useState(0);

  useEffect(() => {
    const fetchFraudData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/transactions/laundering"
        ); // Adjust API URL if needed
        const formattedData = response.data.map((t: any) => ({
          date: `${t.Date} ${t.Time}`, // Format date and time
          amount: t.Amount,
          transactionId: t.Transaction_ID,
        }));

        // Calculate total fraud amount
        const total = formattedData.reduce((sum, t) => sum + t.amount, 0);

        setFraudData(formattedData);
        setTotalFraudAmount(total);
      } catch (error) {
        console.error("Error fetching fraud transactions:", error);
      }
    };

    fetchFraudData();
  }, []);

  const pieData = Object.entries(launderingCategories).map(([type, txns]) => ({
    name: type || "Non-Laundering",
    value: (txns as any[]).length,
  }));

  const barData = transactions.map((t) => ({
    id: t.Transaction_ID,
    amount: t.Amount,
    isLaundering: t.Is_laundering,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-gray-900/95 backdrop-blur-md border-b border-gray-700 py-4 px-6 shadow-lg"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-2xl font-bold text-indigo-400 flex items-center gap-2"
          >
            <AlertTriangle className="w-6 h-6" />
            Anti-Fraud Dashboard
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button
              variant="outline"
              onClick={handleLogout}
              className="bg-gray-800 text-white border-gray-600 hover:bg-gray-700 hover:text-indigo-300 transition-all"
            >
              Logout
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="md:col-span-1"
          >
            <Card className="bg-gray-900/95 backdrop-blur-md border border-gray-700 shadow-xl rounded-xl">
              <CardContent className="p-6">
                <nav className="space-y-3">
                  <motion.div
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      variant={activeTab === "settings" ? "default" : "ghost"}
                      className={`w-full justify-start text-gray-300 hover:text-indigo-400 hover:bg-gray-800 transition-all ${
                        activeTab === "settings"
                          ? "bg-indigo-600 text-white"
                          : ""
                      }`}
                      onClick={() => setActiveTab("settings")}
                    >
                      <Settings className="mr-2 h-5 w-5" />
                      Settings
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      variant={activeTab === "admin" ? "default" : "ghost"}
                      className={`w-full justify-start text-gray-300 hover:text-indigo-400 hover:bg-gray-800 transition-all ${
                        activeTab === "admin" ? "bg-indigo-600 text-white" : ""
                      }`}
                      onClick={() => setActiveTab("admin")}
                    >
                      <AlertTriangle className="mr-2 h-5 w-5" />
                      Admin Panel
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      variant={
                        activeTab === "transactions" ? "default" : "ghost"
                      }
                      className={`w-full justify-start text-gray-300 hover:text-indigo-400 hover:bg-gray-800 transition-all ${
                        activeTab === "transactions"
                          ? "bg-indigo-600 text-white"
                          : ""
                      }`}
                      onClick={() => setActiveTab("transactions")}
                    >
                      <DollarSign className="mr-2 h-5 w-5" />
                      Transactions
                    </Button>
                  </motion.div>
                </nav>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="mt-8 pt-6 border-t border-gray-700"
                >
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-medium text-indigo-400">
                      Need Assistance?
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Explore our docs or reach out to support for help with
                      fraud detection.
                    </p>
                    <Button
                      variant="link"
                      className="text-indigo-400 p-0 h-auto mt-2 text-sm hover:text-indigo-300 transition-colors"
                    >
                      View Documentation
                    </Button>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main content area */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="md:col-span-3"
          >
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsContent value="settings" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Card className="bg-gray-900/95 backdrop-blur-md border border-gray-700 shadow-xl rounded-xl">
                    <CardContent className="p-6">
                      {/* <UserSettings /> */}
                      <div className="max-w-4xl mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg">
                        <h2 className="text-3xl font-bold text-center mb-8">
                          User Settings
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
                            <h3 className="text-xl font-semibold mb-4">
                              Personal Info
                            </h3>
                            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                              <span className="text-gray-400">Username</span>
                              <span className="text-lg font-medium">
                                {user?.username || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                              <span className="text-gray-400">Email</span>
                              <span className="text-lg font-medium">
                                {user?.email || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                              <span className="text-gray-400">
                                Bank Account
                              </span>
                              <span className="text-lg font-medium">
                                {user?.bankAccount || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                              <span className="text-gray-400">Balance</span>
                              <span className="text-lg font-medium">
                                {user?.balance !== undefined
                                  ? `$${user?.balance}`
                                  : "N/A"}
                              </span>
                            </div>
                          </div>

                          <div className="bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
                            <h3 className="text-xl font-semibold mb-4">
                              Account Details
                            </h3>
                            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                              <span className="text-gray-400">User ID</span>
                              <span className="text-lg font-medium">
                                {user?._id || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                              <span className="text-gray-400">Google User</span>
                              <span className="text-lg font-medium">
                                {user?.isGoogleUser ? "Yes" : "No"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                              <span className="text-gray-400">
                                KYC Verified
                              </span>
                              <span
                                className={`text-lg font-medium ${
                                  user?.isKycVerified
                                    ? "text-green-400"
                                    : "text-yellow-400"
                                }`}
                              >
                                {user?.isKycVerified
                                  ? "Verified ✅"
                                  : "Pending ⏳"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                              <span className="text-gray-400">
                                Account Status
                              </span>
                              <span
                                className={`text-lg font-medium ${
                                  user?.isSuspended
                                    ? "text-red-400"
                                    : "text-green-400"
                                }`}
                              >
                                {user?.isSuspended
                                  ? "Suspended 🚫"
                                  : "Active ✅"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-10 bg-gray-800 p-6 rounded-lg shadow-md">
                          <h3 className="text-xl font-semibold mb-4">
                            Registered Devices
                          </h3>
                          {user?.deviceId && user?.deviceId.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm text-left border border-gray-700 rounded-md">
                                <thead>
                                  <tr className="bg-gray-700">
                                    <th className="p-3 text-gray-300">
                                      Device ID
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {user?.deviceId.map((deviceId, index) => (
                                    <tr
                                      key={index}
                                      className="border-b border-gray-600"
                                    >
                                      <td className="p-3">{deviceId}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-gray-400">
                              No registered devices found.
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="admin" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Card className="bg-gray-900/95 backdrop-blur-md border border-gray-700 shadow-xl rounded-xl">
                    <CardContent className="p-6">
                      <Tabs
                        value={activeTab2}
                        onValueChange={setActiveTab2}
                        className="space-y-6 flex flex-col"
                      >
                        <TabsList className="grid grid-cols-2 w-[50%] self-end bg-gray-800 border border-gray-700 rounded-lg p-1">
                          <TabsTrigger
                            value="Fraudulent Transactions"
                            className="text-gray-300 data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-md transition-all"
                          >
                            Fraudulent Transactions
                          </TabsTrigger>
                          <TabsTrigger
                            value="Flagged Users"
                            className="text-gray-300 data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-md transition-all"
                          >
                            Flagged Users
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent
                          value="Fraudulent Transactions"
                          className="space-y-6"
                        >
                          {/* Charts */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            {/* Amount Transmitted Line Chart */}
                            <Card className="bg-gray-800 border-gray-700">
                              <CardContent className="p-4">
                                <h3 className="text-lg font-medium text-white mb-2">
                                  Fraudulent Transactions Over Time
                                </h3>
                                <ResponsiveContainer width="100%" height={200}>
                                  <LineChart data={fraudData}>
                                    <CartesianGrid
                                      strokeDasharray="3 3"
                                      stroke="#444"
                                    />
                                    <XAxis dataKey="date" stroke="#888" />
                                    <YAxis stroke="#888" />
                                    <Tooltip
                                      formatter={(value, name, entry) => [
                                        `$${value}`,
                                        `Transaction ID: ${entry.payload.transactionId}`,
                                      ]}
                                    />
                                    <Line
                                      type="monotone"
                                      dataKey="amount"
                                      stroke="#8884d8"
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </CardContent>
                            </Card>

                            {/* Laundering Types Pie Chart */}
                            <Card className="bg-gray-800 border-gray-700">
                              <CardContent className="p-4">
                                <h3 className="text-lg font-medium text-white mb-2">
                                  Fraud Types
                                </h3>
                                <ResponsiveContainer width="100%" height={200}>
                                  <PieChart>
                                    <Pie
                                      data={pieData}
                                      cx="50%"
                                      cy="50%"
                                      outerRadius={80}
                                      fill="#8884d8"
                                      dataKey="value"
                                      label
                                    />
                                    <Tooltip
                                      contentStyle={{
                                        backgroundColor: "#333",
                                        border: "none",
                                      }}
                                    />
                                  </PieChart>
                                </ResponsiveContainer>
                              </CardContent>
                            </Card>

                            {/* Fraudulent Transactions Bar Chart */}
                            <Card className="md:col-span-2 bg-gray-800 border-gray-700">
                              <CardContent className="p-4">
                                <h3 className="text-lg font-medium text-white mb-2">
                                  Fraudulent Transactions
                                </h3>
                                <ResponsiveContainer width="100%" height={200}>
                                  <BarChart data={barData}>
                                    <CartesianGrid
                                      strokeDasharray="3 3"
                                      stroke="#444"
                                    />
                                    <XAxis dataKey="id" stroke="#888" />
                                    <YAxis stroke="#888" />
                                    <Tooltip
                                      contentStyle={{
                                        backgroundColor: "#333",
                                        border: "none",
                                      }}
                                    />
                                    <Bar
                                      dataKey="amount"
                                      fill="#8884d8"
                                      shape={(props) => {
                                        // Ensure bars have fixed colors without hover effects
                                        const { x, y, width, height, payload } =
                                          props;
                                        return (
                                          <rect
                                            x={x}
                                            y={y}
                                            width={width}
                                            height={height}
                                            fill={
                                              payload.isLaundering
                                                ? "#ff5555"
                                                : "#8884d8"
                                            }
                                            className="pointer-events-none"
                                          />
                                        );
                                      }}
                                    />
                                  </BarChart>
                                </ResponsiveContainer>
                              </CardContent>
                            </Card>
                          </div>

                          <div className="bg-gray-800  shadow-lg border border-white m-6 rounded-2xl p-6 backdrop-blur-md">
                            <h2 className="text-xl font-bold text-white mb-4">
                              Filter Transactions
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              <Input
                                placeholder="Transaction ID"
                                value={filters.transactionId}
                                onChange={(e) =>
                                  setFilters({
                                    ...filters,
                                    transactionId: e.target.value,
                                  })
                                }
                                className="input-field"
                              />

                              <Input
                                type="date"
                                value={filters.date}
                                onChange={(e) =>
                                  setFilters({
                                    ...filters,
                                    date: e.target.value,
                                  })
                                }
                                className="input-field"
                              />

                              <Input
                                placeholder="Sender Account"
                                type="number"
                                value={filters.senderAccount}
                                onChange={(e) =>
                                  setFilters({
                                    ...filters,
                                    senderAccount: e.target.value,
                                  })
                                }
                                className="input-field"
                              />

                              <Input
                                placeholder="Receiver Account"
                                type="number"
                                value={filters.receiverAccount}
                                onChange={(e) =>
                                  setFilters({
                                    ...filters,
                                    receiverAccount: e.target.value,
                                  })
                                }
                                className="input-field"
                              />

                              <Input
                                placeholder="Min Amount"
                                type="number"
                                value={filters.amountMin}
                                onChange={(e) =>
                                  setFilters({
                                    ...filters,
                                    amountMin: e.target.value,
                                  })
                                }
                                className="input-field"
                              />

                              <Input
                                placeholder="Max Amount"
                                type="number"
                                value={filters.amountMax}
                                onChange={(e) =>
                                  setFilters({
                                    ...filters,
                                    amountMax: e.target.value,
                                  })
                                }
                                className="input-field"
                              />

                              <Input
                                placeholder="Payment Type"
                                value={filters.paymentType}
                                onChange={(e) =>
                                  setFilters({
                                    ...filters,
                                    paymentType: e.target.value,
                                  })
                                }
                                className="input-field"
                              />

                              <Select
                                value={filters.isLaundering}
                                onValueChange={(value) =>
                                  setFilters({
                                    ...filters,
                                    isLaundering: value,
                                  })
                                }
                              >
                                <SelectTrigger className="input-field">
                                  <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value=" ">All</SelectItem>
                                  <SelectItem value="1">Laundering</SelectItem>
                                  <SelectItem value="0">
                                    Non-Laundering
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex justify-end gap-4 mt-6">
                              <Button
                                onClick={() => {
                                  fetchTransactions();
                                  setFilters(clearFilters);
                                }}
                                className="bg-red-500 hover:bg-red-400 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                              >
                                Clear Filters
                              </Button>

                              <Button
                                onClick={applyFilters}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                              >
                                Apply Filters
                              </Button>
                            </div>
                          </div>

                          {/* Transactions Table */}
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow className="border-gray-700">
                                  <TableHead className="text-gray-300">
                                    Transaction ID
                                  </TableHead>
                                  <TableHead className="text-gray-300">
                                    Date
                                  </TableHead>
                                  <TableHead className="text-gray-300">
                                    Amount
                                  </TableHead>
                                  <TableHead className="text-gray-300">
                                    Laundering
                                  </TableHead>
                                  <TableHead className="text-gray-300">
                                    Details
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {transactions.map((txn) => (
                                  <motion.tr
                                    key={txn.Transaction_ID}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className={`${
                                      txn.Is_laundering ? "bg-red-900/20" : ""
                                    } hover:bg-gray-800`}
                                  >
                                    <TableCell className="text-gray-300">
                                      {txn.Transaction_ID}
                                    </TableCell>
                                    <TableCell className="text-gray-300">
                                      {txn.Date}
                                    </TableCell>
                                    <TableCell className="text-gray-300">
                                      {txn.Amount} {txn.Payment_currency}
                                    </TableCell>
                                    <TableCell className="text-gray-300">
                                      {txn.Is_laundering ? (
                                        <span className="text-red-400">
                                          Yes
                                        </span>
                                      ) : (
                                        <span className="text-green-400">
                                          No
                                        </span>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button
                                            variant="outline"
                                            className="text-indigo-400 border-indigo-400 hover:bg-indigo-400 hover:text-white"
                                          >
                                            View
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-gray-900 text-white border-gray-700">
                                          <DialogHeader>
                                            <DialogTitle>
                                              Transaction Details -{" "}
                                              {txn.Transaction_ID}
                                            </DialogTitle>
                                          </DialogHeader>
                                          <div className="space-y-2">
                                            <p>
                                              <strong>Sender:</strong>{" "}
                                              {txn.Sender_account}
                                            </p>
                                            <p>
                                              <strong>Receiver:</strong>{" "}
                                              {txn.Receiver_account}
                                            </p>
                                            <p>
                                              <strong>Amount:</strong>{" "}
                                              {txn.Amount}{" "}
                                              {txn.Payment_currency}
                                            </p>
                                            {txn.Is_laundering && (
                                              <p>
                                                <strong>
                                                  Laundering Type:
                                                </strong>{" "}
                                                {txn.Laundering_type}
                                              </p>
                                            )}
                                          </div>
                                        </DialogContent>
                                      </Dialog>
                                    </TableCell>
                                  </motion.tr>
                                ))}
                              </TableBody>
                            </Table>
                          </div>

                          {/* Pagination */}
                          <div className="flex justify-between mt-4">
                            <Button
                              onClick={() => setPage(page - 1)}
                              disabled={page === 1}
                              className="bg-gray-800 text-white hover:bg-gray-700"
                            >
                              Previous
                            </Button>
                            <span className="text-gray-300">
                              Page {page} of {Math.ceil(total / limit)}
                            </span>
                            <Button
                              onClick={() => setPage(page + 1)}
                              disabled={page === Math.ceil(total / limit)}
                              className="bg-gray-800 text-white hover:bg-gray-700"
                            >
                              Next
                            </Button>
                          </div>
                        </TabsContent>
                        <TabsContent
                          value="Flagged Users"
                          className="space-y-6"
                        >
                          <h2 className="text-2xl font-bold text-white">
                            🚨 Flagged Users
                          </h2>

                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-700 bg-transparent rounded-lg">
                              <thead>
                                <tr className="text-left bg-gray-900 text-white">
                                  <th className="p-4 border border-gray-700">
                                    User
                                  </th>
                                  <th className="p-4 border border-gray-700">
                                    Risk Level
                                  </th>
                                  <th className="p-4 border border-gray-700">
                                    Suspicious Transactions
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {flaggedUsers.map(
                                  ({ user, transactions, riskLevel }) => (
                                    <tr
                                      key={user}
                                      className="border border-gray-700 hover:bg-gray-800 transition"
                                    >
                                      <td className="p-4 text-white">{user}</td>
                                      <td className="p-4">
                                        <Badge
                                          className={`${riskColors[riskLevel]} px-3 py-1`}
                                        >
                                          {riskLevel} Risk
                                        </Badge>
                                      </td>
                                      <td className="p-4">
                                        <div className="space-y-2">
                                          {transactions.map((txn) => (
                                            <div
                                              key={txn.Transaction_ID}
                                              className="p-3 bg-transparent border border-gray-700 rounded-lg text-white text-sm"
                                            >
                                              <p>
                                                <strong>ID:</strong>{" "}
                                                {txn.Transaction_ID}
                                              </p>
                                              <p>
                                                <strong>Amount:</strong>{" "}
                                                {txn.Amount}{" "}
                                                {txn.Payment_currency}
                                              </p>
                                              <p>
                                                <strong>From:</strong>{" "}
                                                {txn.Sender_bank_location} →{" "}
                                                <strong>To:</strong>{" "}
                                                {txn.Receiver_bank_location}
                                              </p>
                                              <p>
                                                <strong>Type:</strong>{" "}
                                                {txn.Payment_type}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="transactions" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <TransactionsTab />
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 pb-6"
      >
        <div className="flex justify-center gap-6 text-gray-500 text-xs">
          <span className="flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            AI-Powered Fraud Detection
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
            Blockchain Security
          </span>
        </div>
      </motion.footer>
    </div>
  );
};

export default Dashboard;
