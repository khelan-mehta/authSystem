const ProcessedImageDisplay = ({ processedImage }) => {
    if (!processedImage) return null;
  
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Processed Image</h3>
        <div className="w-full max-w-md rounded-md overflow-hidden border border-gray-200">
          <img src={processedImage} alt="Processed Result" className="w-full h-auto object-contain" />
        </div>
      </div>
    );
  };
  
  export default ProcessedImageDisplay;