import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export const Input: React.FC<InputProps> = ({ label, ...rest }) => {
  return <input className="border px-2 py-1 rounded" {...rest} />;
};

export default Input;
