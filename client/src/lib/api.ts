
// Simulated API service for the AI catalogue generator

/**
 * Process an image to generate a catalogue
 * @param image The image file to process
 * @param options Configuration options for the generation
 * @returns A Promise that resolves with the processing result
 */
export const generateCatalogue = async (
  image: File,
  options: {
    pattern?: "circles" | "stripes" | "triangles" | "grid" | "hexagons" | "diagonal" | "waves";
    templateName?: string;
  } = {}
): Promise<{
  catalogueId: string;
  imageSummary: string;
  imageUrl: string;
  pdfUrl: string;
  advantages: string[];
}> => {
  // In a real implementation, this would upload the image to a server
  // and call the Python backend for processing
  
  // Simulate a delay for processing
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Mock response
  return {
    catalogueId: Math.random().toString(36).substring(2, 10),
    imageSummary: "A modern water bottle with vacuum insulation and sleek design",
    imageUrl: URL.createObjectURL(image),
    pdfUrl: "#", // This would be a real URL in production
    advantages: [
      "Leak proof",
      "24h cold",
      "Eco-friendly",
      "Lightweight"
    ]
  };
};

/**
 * Get a list of the user's previously generated catalogues
 * @returns A Promise that resolves with an array of catalogue objects
 */
export const getUserCatalogues = async (): Promise<Array<{
  id: string;
  name: string;
  createdAt: string;
  imageUrl: string;
  pdfUrl: string;
}>> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock data
  return [
    {
      id: "cat123",
      name: "Water Bottle Catalogue",
      createdAt: "2023-06-15",
      imageUrl: "/placeholder.svg",
      pdfUrl: "#"
    },
    {
      id: "cat456",
      name: "Headphones Catalogue",
      createdAt: "2023-06-10",
      imageUrl: "/placeholder.svg",
      pdfUrl: "#"
    }
  ];
};

/**
 * Get available templates for catalogue generation
 * @returns A Promise that resolves with template data
 */
export const getCatalogueTemplates = async (): Promise<Array<{
  id: string;
  name: string;
  thumbnail: string;
  description: string;
}>> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock templates
  return [
    {
      id: "temp1",
      name: "Modern",
      thumbnail: "/placeholder.svg",
      description: "Clean, minimalist design with focus on product"
    },
    {
      id: "temp2",
      name: "Classic",
      thumbnail: "/placeholder.svg",
      description: "Traditional layout with elegant typography"
    },
    {
      id: "temp3",
      name: "Bold",
      thumbnail: "/placeholder.svg",
      description: "High contrast design with strong visual impact"
    }
  ];
};

// API interfaces for type safety

export interface User {
  id: string;
  name: string;
  email: string;
  company?: string;
  industry?: string;
}

export interface ApiKey {
  key: string;
  created: string;
  lastUsed: string;
}

/**
 * User authentication service (simplified mock)
 */
export const authService = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    // In a real implementation, this would validate credentials with a server
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email && password) {
      return {
        token: "mock-jwt-token",
        user: {
          id: "user123",
          name: "John Doe",
          email: email
        }
      };
    }
    
    throw new Error("Invalid credentials");
  },
  
  register: async (name: string, email: string, password: string): Promise<{ token: string; user: User }> => {
    // In a real implementation, this would create an account on a server
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (name && email && password) {
      return {
        token: "mock-jwt-token",
        user: {
          id: "user123",
          name: name,
          email: email
        }
      };
    }
    
    throw new Error("Invalid registration data");
  },
  
  logout: async (): Promise<void> => {
    // Clear session data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};
