import React, { type InputHTMLAttributes } from "react";
import "./Input.css";

export const Input: React.FC<InputHTMLAttributes<HTMLInputElement>> = (
  props
) => {
  return <input className="shared-input" {...props} />;
};
