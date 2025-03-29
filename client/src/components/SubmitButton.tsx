import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const SubmitButton = ({ processing, disabled, onClick }) => {
  return (
    <Button
      onClick={onClick}
      disabled={processing || disabled}
      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
    >
      {processing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        "Submit"
      )}
    </Button>
  );
};

export default SubmitButton;