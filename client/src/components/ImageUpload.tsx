import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

const ImageUpload = ({ image, preview, onImageChange, toast }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPEG, PNG, etc.)",
          variant: "destructive",
        });
        return;
      }
      onImageChange(file);
    }
  };

  return (
    <div>
      <label htmlFor="photo-upload" className="block text-sm font-medium text-gray-700 mb-2">
        Product Image
      </label>
      <div className="flex items-center space-x-4">
        <input
          type="file"
          id="photo-upload"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />
        <Button
          variant="outline"
          className="flex items-center space-x-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          <span>{preview ? "Change Image" : "Upload Image"}</span>
        </Button>
        {preview && (
          <div className="w-20 h-20 rounded-md overflow-hidden border border-gray-200">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
      <p className="mt-1 text-sm text-gray-500">PNG, JPG, WEBP (max. 10MB)</p>
    </div>
  );
};

export default ImageUpload;