import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, AlertTriangle, Loader } from "lucide-react";

export default function KYCVerification() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const checkKYC = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/verification/initial/${userId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (response.status === 201) {
          const data = await response.json();

          if (data.status === "verified") {
            // Call second API to update KYC status in user model
            await fetch(`http://localhost:3001/api/auth/kyc`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId }),
            });

            setVerified(true);
            setTimeout(() => navigate("/dashboard"), 2000);
          } else {
            setError("KYC verification in progress. Please wait.");
          }
        } else {
          setError("Invalid response from server.");
        }
      } catch (err) {
        setError("Network error, please try again.");
      }
      setLoading(false);
    };

    checkKYC();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-6">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">KYC Verification</h2>

        {loading ? (
          <div className="flex flex-col items-center">
            <Loader className="animate-spin text-blue-500 h-12 w-12" />
            <p className="mt-3 text-gray-600">Checking KYC status...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center text-red-500">
            <AlertTriangle className="h-12 w-12" />
            <p className="mt-3 font-medium">{error}</p>
          </div>
        ) : verified ? (
          <div className="flex flex-col items-center text-green-600">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <p className="mt-3 text-xl font-semibold">Verified!! ✅</p>
          </div>
        ) : (
          <p className="text-gray-600">Processing your request...</p>
        )}

        <button
          disabled
          className="mt-6 w-full bg-gray-500 text-white px-4 py-2 rounded-lg cursor-not-allowed"
        >
          Checking...
        </button>
      </div>
    </div>
  );
}
