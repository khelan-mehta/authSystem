import React, { useState, FC } from "react";

interface InputWithIconProps {
  id: string;
  type: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onClick?: any;
  placeholder?: string;
  icon?: string; // Path to the icon
  extraClasses?: string; // Additional classes for customization
  withIcon?: boolean; // Toggle the presence of the icon
  width?: string; // Tailwind width classes (e.g., "w-full", "w-1/2")
  required?: boolean; // Input required attribute
  labelValue?: string;
  isEditable?: boolean;
  isTextArea?: boolean; // New prop to toggle between input and textarea
}

const InputWithIcon: FC<InputWithIconProps> = ({
  id,
  type,
  value,
  isEditable,
  onChange,
  onClick,
  placeholder = "",
  icon,
  extraClasses = "",
  withIcon = true,
  width = "w-full",
  required = false,
  labelValue,
  isTextArea = false, // Default to false, assuming it's an input by default
}) => {
  return (
    <div className={`relative mb-2 ${extraClasses}`}>
      <label htmlFor={id} className="text-white orbitron text-sm">
        {labelValue}
      </label>
      {isTextArea ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          contentEditable={isEditable}
          placeholder={placeholder}
          required={required}
          className={`min-h-[130px] max-h-[130px] mt-2 block px-6 py-3 text-xs text-white orbitron-light rounded-[8px] bg-[#181818] border-white border-[1px] border-solid focus:outline-none ${width}`}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          contentEditable={isEditable}
          placeholder={placeholder}
          required={required}
          className={`min-h-[50px] mt-2 block px-6 py-3 text-xs text-white orbitron-light rounded-[8px] bg-[#181818] border-white border-[1px] border-solid focus:outline-none ${width}`}
        />
      )}
      {withIcon && icon && (
        <div
          className="absolute z-50 right-0 bottom-0 flex h-[50px] items-center justify-center px-3 py-3 rounded-r-[8px] bg-[#4DFF00] cursor-pointer"
          onClick={onClick}
        >
          <img src={icon} alt="icon" className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};

export default InputWithIcon;
