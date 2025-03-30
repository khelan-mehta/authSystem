import React, { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const KYCVerificationPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Info
    name: "",
    dateOfBirth: "",
    panCard: "",
    riskCategory: "Low",
    identityProofType: "Aadhaar Card",
    identityProofNumber: "",
    addressProofType: "passport",
    addressProofNumber: "",

    // Documents
    identityProofFile: null,
    addressProofFile: null,

    // Photo
    photo: null,
  });

  // Preview states
  const [identityProofPreview, setIdentityProofPreview] = useState(null);
  const [addressProofPreview, setAddressProofPreview] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (name === "identityProofFile") {
          setIdentityProofPreview(event.target.result);
        } else if (name === "addressProofFile") {
          setAddressProofPreview(event.target.result);
        } else if (name === "photo") {
          setPhotoPreview(event.target.result);
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleCapturePhoto = () => {
    // Get access to webcam
    const videoElement = document.createElement("video");
    const canvasElement = document.createElement("canvas");

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoElement.srcObject = stream;
        videoElement.play();

        // After 3 seconds, take photo
        setTimeout(() => {
          canvasElement.width = videoElement.videoWidth;
          canvasElement.height = videoElement.videoHeight;
          canvasElement.getContext("2d").drawImage(videoElement, 0, 0);

          // Convert to file
          canvasElement.toBlob((blob) => {
            const photoFile = new File([blob], "user-photo.png", {
              type: "image/png",
            });
            setFormData((prev) => ({ ...prev, photo: photoFile }));
            setPhotoPreview(canvasElement.toDataURL("image/png"));

            // Stop camera
            stream.getTracks().forEach((track) => track.stop());
          });
        }, 3000);
      })
      .catch((error) => {
        console.error("Error accessing camera:", error);
        toast.error("Could not access camera. Please check permissions.");
      });
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.name || !formData.dateOfBirth || !formData.panCard) {
      toast.error("Please fill in all required personal information");
      return false;
    }

    if (!formData.identityProofNumber || !formData.addressProofNumber) {
      toast.error("Please provide all document numbers");
      return false;
    }

    if (!formData.identityProofFile || !formData.addressProofFile) {
      toast.error("Please upload all required documents");
      return false;
    }

    if (!formData.photo) {
      toast.error("Please take or upload your photo");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data in the same format as the original code
      const kycData = {
        name: formData.name,
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
        panCard: formData.panCard,
        riskCategory: formData.riskCategory,
        identityProof: {
          type: formData.identityProofType,
          documentNumber: formData.identityProofNumber,
        },
        addressProof: {
          type: formData.addressProofType,
          documentNumber: formData.addressProofNumber,
        },
        recentPhotograph: "",
      };

      // Create form data for API call
      const apiFormData = new FormData();

      // Add KYC data
      Object.keys(kycData).forEach((key) => {
        if (typeof kycData[key] === "object") {
          Object.keys(kycData[key]).forEach((nestedKey) => {
            apiFormData.append(`${key}[${nestedKey}]`, kycData[key][nestedKey]);
          });
        } else {
          apiFormData.append(key, kycData[key]);
        }
      });

      // Add document files
      apiFormData.append("documentVerification", formData.identityProofFile);

      // First API call - same as in original code
      const userId = localStorage.getItem("userId"); // Ideally this should come from context or state
      const response = await fetch(
        `http://localhost:3000/api/kyc/individual/${userId}`,
        {
          method: "POST",
          body: apiFormData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit KYC data.");
      }

      const result = await response.json();

      // Second API call for photo upload
      const photoFormData = new FormData();
      photoFormData.append("photo", formData.photo);

      const photoResponse = await fetch(
        `http://localhost:3000/api/uploads/${userId}`,
        {
          method: "POST",
          body: photoFormData,
        }
      );

      if (!photoResponse.ok) {
        throw new Error("Failed to upload photo.");
      }

      console.log("KYC Verification Successful:", result);

      // Show success message
      toast.success("KYC verification completed successfully!");

      // Redirect after delay
      setTimeout(() => {
        toast("Redirecting to validation page...");
        navigate("/validate");
      }, 2000);
    } catch (error) {
      console.error("Error submitting KYC data:", error);
      toast.error("Failed to submit KYC verification. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 py-6 px-8">
            <h1 className="text-2xl font-bold text-white">KYC Verification</h1>
            <p className="text-blue-100 mt-1">
              Complete your verification in one step to access all platform
              features
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            {/* Personal Information Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PAN Card Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="panCard"
                    value={formData.panCard}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Identity Proof Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                Identity Proof
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Identity Proof Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="identityProofType"
                    value={formData.identityProofType}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="Aadhaar Card">Aadhar Card</option>
                    <option value="passport">Passport</option>
                    <option value="voter">Voter ID</option>
                    <option value="driving">Driving License</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Identity Proof Number{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="identityProofNumber"
                    value={formData.identityProofNumber}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Identity Proof Document{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      {identityProofPreview ? (
                        <div>
                          <img
                            src={identityProofPreview}
                            alt="Identity Proof Preview"
                            className="mx-auto h-32 object-cover"
                          />
                          <p className="text-xs text-gray-500">
                            Click below to change
                          </p>
                        </div>
                      ) : (
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="identityProofFile"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                          <span>Upload a file</span>
                          <input
                            id="identityProofFile"
                            name="identityProofFile"
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                            accept="image/*,.pdf"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, PDF up to 10MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Proof Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                Address Proof
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Proof Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="addressProofType"
                    value={formData.addressProofType}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="Aadhaar Card">Aadhar Card</option>
                    <option value="passport">Passport</option>
                    <option value="utility">Utility Bill</option>
                    <option value="bank">Bank Statement</option>
                    <option value="rental">Rent Agreement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Proof Number/Reference{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="addressProofNumber"
                    value={formData.addressProofNumber}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Address Proof Document{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      {addressProofPreview ? (
                        <div>
                          <img
                            src={addressProofPreview}
                            alt="Address Proof Preview"
                            className="mx-auto h-32 object-cover"
                          />
                          <p className="text-xs text-gray-500">
                            Click below to change
                          </p>
                        </div>
                      ) : (
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="addressProofFile"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                          <span>Upload a file</span>
                          <input
                            id="addressProofFile"
                            name="addressProofFile"
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                            accept="image/*,.pdf"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, PDF up to 10MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Photo Verification Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                Photo Verification
              </h2>

              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Please provide a clear photo of your face for identity
                  verification. You can either upload a photo or take one using
                  your camera.
                </p>

                <div className="flex flex-col items-center">
                  {photoPreview ? (
                    <div className="mb-4">
                      <img
                        src={photoPreview}
                        alt="User Photo"
                        className="w-48 h-48 object-cover rounded-full border-4 border-blue-500"
                      />
                    </div>
                  ) : (
                    <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                      <svg
                        className="h-24 w-24 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={handleCapturePhoto}
                      className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Take Photo
                    </button>

                    <label className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                      Upload Photo
                      <input
                        type="file"
                        name="photo"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Consent and Submit */}
            <div className="mt-8">
              <div className="mb-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="consent"
                      name="consent"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      required
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="consent"
                      className="font-medium text-gray-700"
                    >
                      I confirm that all information provided is accurate and
                      true.
                    </label>
                    <p className="text-gray-500">
                      I authorize the verification of my identity and agree to
                      the terms and conditions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`py-3 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Processing..." : "Complete Verification"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default KYCVerificationPage;
