import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: string;
};

export const Button: React.FC<ButtonProps> = ({ children, variant, ...rest }) => {
  const base = "px-4 py-2 rounded bg-blue-600 text-white";
  return (
    <button className={base} {...rest}>
      {children}
    </button>
  );
};

export default Button;
