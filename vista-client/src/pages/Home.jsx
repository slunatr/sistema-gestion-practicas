import React from "react";
import { useNavigate } from "react-router-dom";
import "../Style/Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-hero">
      <div className="home-overlay">
        <div className="home-content">
          <h1 className="home-title">Bienvenido al Portal de Prácticas</h1>
          <p className="home-subtitle">
            Universidad Central de Chile — Facultad de Ingeniería
          </p>

          <div className="home-buttons">
            <button onClick={() => navigate("/login")} className="home-btn">
              Soy Centralin@
            </button>
            <p className="home-link" onClick={() => navigate("/register")}>
              ¿No tienes cuenta? <strong>Regístrate aquí</strong>
            </p>

            <button
              onClick={() => navigate("/login-empresa")}
              className="home-btn-secondary"
            >
              Soy Empresa
            </button>
            <p className="home-link" onClick={() => navigate("/register-empresa")}>
              ¿Eres una empresa nueva? <strong>Regístrate aquí</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}