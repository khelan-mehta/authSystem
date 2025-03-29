import { X } from "lucide-react";
import React, { useEffect } from "react";
import { motion } from "framer-motion";

interface MessageBoxProps {
  type: string;
  message: string;
  onClose: () => void;
}

export const MessageBox: React.FC<MessageBoxProps> = ({
  type,
  message,
  onClose,
}) => {
  useEffect(() => {
    // Auto-close the message box after 3 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer); // Clear the timer if the component unmounts
  }, [onClose]);

  return (
    <>
      {/* Background blur with overlay */}
      <div className="fixed inset-0 bg-black opacity-70 backdrop-blur-md z-40" />

      {/* Message box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed z-50 bottom-2 w-[345px] self-center p-4 rounded-[8px] shadow-lg bg-black border-[#4dff00] border-2 border-solid text-[#4dff00] flex justify-between items-center`}
        style={{ zIndex: 100 }}
      >
        <p>{message}</p>
        <button
          onClick={onClose}
          className="text-sm underline hover:text-gray-200"
        >
          <X />
        </button>
      </motion.div>

      {/* Blurring background content effect */}
      <div
        className="fixed w-screen h-screen  top-0 z-50 transition-all duration-300"
        style={{ backdropFilter: "blur(5px)" }}
      />
    </>
  );
};
