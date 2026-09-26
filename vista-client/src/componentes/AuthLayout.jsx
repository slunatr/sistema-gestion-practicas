import React from "react";
import "../Style/AuthLayout.css";
import fondo from "../assets/img/Imagen-fondo.jpg";

export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <div className="auth-overlay">
        {children}
      </div>
    </div>
  );
}