import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const TransactionsTab = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    Time: "",
    Date: "",
    Sender_account: "",
    Receiver_account: "",
    Amount: "",
    Payment_currency: "USD",
    Received_currency: "USD",
    Sender_bank_location: "United States",
    Receiver_bank_location: "United States",
    Payment_type: "Wire Transfer",
    Transaction_ID: "",
  });

  const [sentTransactions, setSentTransactions] = useState([]);
  const [receivedTransactions, setReceivedTransactions] = useState([]);
  const [error, setError] = useState(null);

  // Currencies options
  const currencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY"];

  // Bank locations options
  const bankLocations = [
    "United States",
    "United Kingdom",
    "Germany",
    "France",
    "Japan",
    "Canada",
    "Australia",
    "China",
    "India",
    "Brazil",
  ];

  // Payment types options
  const paymentTypes = [
    "Wire Transfer",
    "ACH",
    "SWIFT",
    "SEPA",
    "Instant Transfer",
    "Check",
  ];

  // Generate unique transaction ID
  const generateTransactionId = () => {
    const timestamp = new Date().getTime().toString();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `TX-${timestamp.slice(-6)}-${random}`;
  };

  // Fetch user data
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
        localStorage.setItem("access_token", response.data.newAccessToken);
        setFormData((prev) => ({
          ...prev,
          Sender_account: response.data.user.bankAccount || "",
          Transaction_ID: generateTransactionId(),
        }));
      } catch (err) {
        setError("Failed to fetch user data");
      }
    };

    fetchUser();
  }, []);

  // Fetch transactions when user data is available
  useEffect(() => {
    if (!user?.bankAccount) return;

    const fetchTransactions = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/transactions/user?bankAccount=${user.bankAccount}`
        );
        setSentTransactions(response.data.sentTransactions);
        setReceivedTransactions(response.data.receivedTransactions);
      } catch (err) {
        setError("Failed to fetch transactions");
      }
    };
    fetchTransactions();
  }, [user?.bankAccount]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get current date and time
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-GB").replace(/\//g, "-"); // DD-MM-YYYY
    const formattedTime = now.toTimeString().split(" ")[0]; // HH:MM:SS

    try {
      // Prepare transaction data
      const transactionData = {
        Time: formattedTime,
        Date: formattedDate,
        Sender_account: user.bankAccount,
        Receiver_account: formData.Receiver_account,
        Amount: parseFloat(formData.Amount),
        Payment_currency: formData.Payment_currency,
        Received_currency: formData.Received_currency,
        Sender_bank_location: formData.Sender_bank_location,
        Receiver_bank_location: formData.Receiver_bank_location,
        Payment_type: formData.Payment_type,
        Transaction_ID: formData.Transaction_ID,
        Is_laundering: 0,
        Laundering_type: "",
      };

      // First, send to prediction service
      let predictedData = { ...transactionData };

      try {
        const predictionResponse = await axios.post(
          "http://localhost:5000/predict",
          transactionData
        );

        // Use prediction response if available
        if (predictionResponse.data) {
          predictedData = {
            ...transactionData,
            Is_laundering: predictionResponse.data.Is_laundering,
            Laundering_type: predictionResponse.data.Laundering_type,
          };
        }
      } catch (predictionErr) {
        console.log(
          "Prediction service error, using default values:",
          predictionErr
        );
        // If prediction service fails, use random values (for demo purposes)
        const randomIsLaundering = Math.random() > 0.8 ? 1 : 0; // 20% chance of being flagged
        const launderingTypes = [
          "Normal_Fan_Out",
          "Money_Laundering_Fan_In",
          "Money_Laundering_Fan_Out",
          "Money_Laundering_Cycle",
        ];
        const randomLaunderingType = randomIsLaundering
          ? launderingTypes[
              Math.floor(Math.random() * (launderingTypes.length - 1)) + 1
            ]
          : "Normal_Fan_Out";

        predictedData.Is_laundering = randomIsLaundering || 0;
        predictedData.Laundering_type = randomLaunderingType;
      }

      // Then send to main server with prediction data included
      const token = localStorage.getItem("access_token");
      await axios.post(
        "http://localhost:3001/api/transactions",
        predictedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Transaction created successfully!");

      // Reset form and generate new transaction ID
      setFormData({
        Time: "",
        Date: "",
        Sender_account: user.bankAccount,
        Receiver_account: "",
        Amount: "",
        Payment_currency: "USD",
        Received_currency: "USD",
        Sender_bank_location: "United States",
        Receiver_bank_location: "United States",
        Payment_type: "Wire Transfer",
        Transaction_ID: generateTransactionId(),
      });

      // Refetch transactions
      const response = await axios.get(
        `http://localhost:3001/api/transactions/user?bankAccount=${user.bankAccount}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSentTransactions(response.data.sentTransactions);
      setReceivedTransactions(response.data.receivedTransactions);
    } catch (err) {
      setError("Failed to create transaction");
      console.error("Transaction error:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="text-white"
    >
      <h2 className="text-2xl font-semibold mb-4">Transactions</h2>

      {error && <p className="text-red-500">{error}</p>}

      {/* Make Payment Form */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
        <h3 className="text-lg font-medium mb-4">Make a Payment</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Sender Account
            </label>
            <input
              type="text"
              name="Sender_account"
              value={formData.Sender_account}
              disabled
              className="w-full bg-gray-600 text-white p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Receiver Account
            </label>
            <input
              type="text"
              name="Receiver_account"
              value={formData.Receiver_account}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white p-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              type="number"
              name="Amount"
              value={formData.Amount}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white p-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Transaction ID
            </label>
            <input
              type="text"
              name="Transaction_ID"
              value={formData.Transaction_ID}
              disabled
              className="w-full bg-gray-600 text-white p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Currency
            </label>
            <select
              name="Payment_currency"
              value={formData.Payment_currency}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white p-2 rounded"
              required
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Received Currency
            </label>
            <select
              name="Received_currency"
              value={formData.Received_currency}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white p-2 rounded"
              required
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Sender Bank Location
            </label>
            <select
              name="Sender_bank_location"
              value={formData.Sender_bank_location}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white p-2 rounded"
              required
            >
              {bankLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Receiver Bank Location
            </label>
            <select
              name="Receiver_bank_location"
              value={formData.Receiver_bank_location}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white p-2 rounded"
              required
            >
              {bankLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Type
            </label>
            <select
              name="Payment_type"
              value={formData.Payment_type}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white p-2 rounded"
              required
            >
              {paymentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2 mt-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              Make Payment
            </button>
          </div>
        </form>
      </div>

      {/* Sent Transactions */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
        <h3 className="text-lg font-medium mb-4">Sent Transactions</h3>
        {sentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-2">Transaction ID</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Time</th>
                  <th className="p-2">Receiver Account</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Currency</th>
                  <th className="p-2">Payment Type</th>
                </tr>
              </thead>
              <tbody>
                {sentTransactions.map((tx) => (
                  <tr
                    key={tx.Transaction_ID}
                    className="border-b border-gray-700"
                  >
                    <td className="p-2">{tx.Transaction_ID}</td>
                    <td className="p-2">{tx.Date}</td>
                    <td className="p-2">{tx.Time}</td>
                    <td className="p-2">{tx.Receiver_account}</td>
                    <td className="p-2">{tx.Amount}</td>
                    <td className="p-2">{tx.Payment_currency}</td>
                    <td className="p-2">{tx.Payment_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No sent transactions found.</p>
        )}
      </div>

      {/* Received Transactions */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-medium mb-4">Received Transactions</h3>
        {receivedTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-2">Transaction ID</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Time</th>
                  <th className="p-2">Sender Account</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Currency</th>
                  <th className="p-2">Payment Type</th>
                </tr>
              </thead>
              <tbody>
                {receivedTransactions.map((tx) => (
                  <tr
                    key={tx.Transaction_ID}
                    className="border-b border-gray-700"
                  >
                    <td className="p-2">{tx.Transaction_ID}</td>
                    <td className="p-2">{tx.Date}</td>
                    <td className="p-2">{tx.Time}</td>
                    <td className="p-2">{tx.Sender_account}</td>
                    <td className="p-2">{tx.Amount}</td>
                    <td className="p-2">{tx.Received_currency}</td>
                    <td className="p-2">{tx.Payment_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No received transactions found.</p>
        )}
      </div>
    </motion.div>
  );
};

export default TransactionsTab;
