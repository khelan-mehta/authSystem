import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import ImageUpload from "./ImageUpload";
import DescriptionInput from "./DescriptionInput";
import SubmitButton from "./SubmitButton";
import ProcessedImageDisplay from "./ProcessedImageDisplay";

const UploadSection = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageChange = (file: File) => {
    setImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(e.target.value);
  };

  const handleSubmit = async () => {
    if (!image) {
      toast({
        title: "No image selected",
        description: "Please upload an image before submitting",
        variant: "destructive",
      });
      return;
    }
  
    setProcessing(true);
    setProcessedImage(null);
  
    try {
      // Step 1: Fetch the S3 upload URL for the original image
      const fetchUrlResponse = await fetch(
        "http://localhost:3001/api/auth/fetch-url/fetch",
        { method: "GET" }
      );
      if (!fetchUrlResponse.ok) throw new Error("Failed to fetch upload URL");
      const fetchUrlData = await fetchUrlResponse.json();
      const uploadURL = fetchUrlData.uploadURL;
      if (!uploadURL) throw new Error("No upload URL received");
  
      // Step 2: Upload the original image to S3
      const uploadResponse = await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": "multipart/form-data" },
        body: image,
      });
      if (!uploadResponse.ok) throw new Error("Failed to upload image to S3");
      const imageUrl = uploadURL.split("?")[0];
      console.log("Uploaded original image URL:", imageUrl);
  
      // Step 3: Send to Flask for processing
      const flaskResponse = await fetch("http://localhost:5000/process-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: imageUrl, description: description }),
      });
      if (!flaskResponse.ok) throw new Error("Failed to process image on the Flask server");
      const imageBlob = await flaskResponse.blob();
      const processedImageUrl = URL.createObjectURL(imageBlob);
      setProcessedImage(processedImageUrl);
  
      // Step 4: Fetch a new S3 upload URL for the processed image
      const fetchProcessedUrlResponse = await fetch(
        "http://localhost:3001/api/auth/fetch-url/fetch",
        { method: "GET" }
      );
      if (!fetchProcessedUrlResponse.ok) throw new Error("Failed to fetch upload URL for processed image");
      const fetchProcessedUrlData = await fetchProcessedUrlResponse.json();
      const processedUploadURL = fetchProcessedUrlData.uploadURL;
      if (!processedUploadURL) throw new Error("No upload URL received for processed image");
  
      // Step 5: Upload the processed image to S3
      const processedUploadResponse = await fetch(processedUploadURL, {
        method: "PUT",
        headers: { "Content-Type": "image/png" },
        body: imageBlob,
      });
      if (!processedUploadResponse.ok) throw new Error("Failed to upload processed image to S3");
      const processedUrl = processedUploadURL.split("?")[0];
      console.log("Uploaded processed image URL:", processedUrl);
  
      // Step 6: Retrieve userId from localStorage
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("User ID not found in localStorage");
  
      // Step 7: Send both URLs and description to NestJS server
      const updateDataResponse = await fetch(
        `http://localhost:3001/api/auth/${userId}/update-data`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: imageUrl,
            description: description,
            processedUrl: processedUrl,
          }),
        }
      );
      if (!updateDataResponse.ok) throw new Error("Failed to update data on the NestJS server");
      const updateDataResult = await updateDataResponse.json();
      console.log("NestJS server update response:", updateDataResult);
  
      // Step 8: Send processed image URL to Flask endpoint to update Excel
      const updateStoreResponse = await fetch("http://localhost:5000/updateStore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: processedUrl, // Sending the processed image URL
          description: description,
        }),
      });
      if (!updateStoreResponse.ok) throw new Error("Failed to update store Excel sheet");
      console.log("Store updated successfully");
  
      toast({
        title: "Success",
        description: "Image processed and saved successfully! Check the result below.",
      });
  
      setImage(null);
      setPreview(null);
      setDescription("");
    } catch (error) {
      console.error("Error during upload:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Upload Product
        </h2>
        <div className="space-y-6">
          <ImageUpload
            image={image}
            preview={preview}
            onImageChange={handleImageChange}
            toast={toast}
          />
          <DescriptionInput
            description={description}
            onDescriptionChange={handleDescriptionChange}
          />
          <SubmitButton
            processing={processing}
            disabled={!image}
            onClick={handleSubmit}
          />
          <ProcessedImageDisplay processedImage={processedImage} />
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadSection;
