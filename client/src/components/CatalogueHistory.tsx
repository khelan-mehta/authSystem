import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download, MoreHorizontal, Trash2, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import { BASE_URL } from "@/env";
import { getSession } from "@/lib/session";
import { useToast } from "@/components/ui/use-toast";
import jsPDF from "jspdf"; // Import jsPDF 

interface Operation {
  _id: string;
  imageUrl: string;
  description: string;
  processedUrl: string;
}

const CatalogueHistory = ({ activeTab }: any) => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [viewOperation, setViewOperation] = useState<Operation | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserOperations();
  }, [activeTab]);

  const fetchUserOperations = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/auth/${getSession("userId")}`,
        {
          headers: {
            Authorization: `Bearer ${getSession("access_token")}`,
          },
        }
      );

      if (response.status === 200) {
        setOperations(response.data.user.operations);
        localStorage.setItem("access_token", response.data.user.accessToken);
      } else {
        throw new Error("Failed to fetch user operations");
      }
    } catch (error) {
      console.error("Error fetching user operations:", error);
      toast({
        title: "Error",
        description: "Failed to load catalogues",
        variant: "destructive",
      });
    }
  };

  const deleteOperation = async (id: string) => {
    try {
      await axios.delete(`${BASE_URL}/api/operations/${id}`, {
        headers: {
          Authorization: `Bearer ${getSession("access_token")}`,
        },
      });
      setOperations(operations.filter((op) => op._id !== id));
      toast({
        title: "Catalogue Deleted",
        description: "The catalogue has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting operation:", error);
      toast({
        title: "Error",
        description: "Failed to delete catalogue",
        variant: "destructive",
      });
    }
  };

  const downloadImage = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = url.split("/").pop() || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper function to create PDF from image URL
  const createPdfFromImage = async (imageUrl: string, description: string) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });
  
    const pageWidth = 595;
    const pageHeight = 842;
  
    // Add header (simulated with a colored rectangle and text)
    doc.setFillColor(50, 100, 150);
    doc.rect(0, 0, pageWidth, 100, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text("Title", pageWidth / 2, 60, { align: "center" });
  
    // Add footer
    doc.setFillColor(50, 100, 150);
    doc.rect(0, pageHeight - 100, pageWidth, 100, "F");
  
    // Set background color
    doc.setFillColor(200, 220, 255);
    doc.rect(0, 100, pageWidth, pageHeight - 200, "F");
  
    try {
      // Fetch the image from the proxy and convert to Base64
      const response = await fetch(`http://localhost:3001/api/auth/image?url=${encodeURIComponent(imageUrl)}`);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
  
      const img = new Image();
      img.src = base64;
  
      img.onload = () => {
        const imgWidth = img.width;
        const imgHeight = img.height;
        const scaleFactor = 1 / 3;
        const newWidth = imgWidth * scaleFactor;
        const newHeight = imgHeight * scaleFactor;
  
        // Center the image
        const imageX = (pageWidth - newWidth) / 2;
        const imageY = 150;
  
        doc.addImage(base64, "PNG", imageX, imageY, newWidth, newHeight);
  
        // Add description below the image
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        const textY = imageY + newHeight + 40;
        doc.text(description, pageWidth / 2, textY, {
          align: "center",
          maxWidth: pageWidth - 100,
        });
  
        // Save the PDF
        doc.save(`catalogue-${description.slice(0, 10)}.pdf`);
      };
  
      img.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to load image for PDF generation",
          variant: "destructive",
        });
      };
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch image for PDF generation",
        variant: "destructive",
      });
    }
  };
  

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">My Catalogues</h2>
          <Button variant="outline">Sort by Date</Button>
        </div>

        {operations.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No catalogues yet
            </h3>
            <p className="text-gray-500 mb-4">
              Upload an image to create your first catalogue
            </p>
            <Button variant="outline">Create New Catalogue</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {operations.map((operation) => (
              <div
                key={operation._id}
                className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-video bg-gray-100 relative">
                  <img
                    src={operation.processedUrl}
                    alt={operation.description}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="mr-2"
                          onClick={() => setViewOperation(operation)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Catalogue Details</DialogTitle>
                          <DialogDescription>
                            {operation.description}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="aspect-[4/3] bg-gray-100 rounded overflow-hidden">
                          <img
                            src={operation.processedUrl}
                            alt={operation.description}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                          <Button
                            variant="outline"
                            onClick={() =>
                              downloadImage(operation.processedUrl)
                            }
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Image
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() =>
                              createPdfFromImage(
                                operation.processedUrl,
                                operation.description
                              )
                            }
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Download PDF
                          </Button>
                          <Button>Edit Catalogue</Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => downloadImage(operation.processedUrl)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium truncate">
                        {operation.description}
                      </h3>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setViewOperation(operation)}
                          className="cursor-pointer"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => downloadImage(operation.processedUrl)}
                          className="cursor-pointer"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Image
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            createPdfFromImage(
                              operation.processedUrl,
                              operation.description
                            )
                          }
                          className="cursor-pointer"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteOperation(operation._id)}
                          className="text-red-600 focus:text-red-500 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CatalogueHistory;