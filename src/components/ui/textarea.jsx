import React from 'react';

const Textarea = ({ value, onChange, placeholder, className, ...props }) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`resize-none border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
};

export  { Textarea }