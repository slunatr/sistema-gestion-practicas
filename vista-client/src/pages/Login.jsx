import React, { useState } from "react";
import AuthLayout from "../componentes/AuthLayout";
import "../Style/Form.css";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("rol", data.user.rol); // ✅ Aquí se guarda explícitamente el rol

        const rol = data.user?.rol;

        if (rol === "PRACT") navigate("/dashboard");
        else if (rol === "EMPRESA") navigate("/mis-practicas-publicadas");
        else if (rol === "EVAL") navigate("/practicas-evaluadas");
        else if (rol === "COORD" || rol === "ADMIN") navigate("/practicas-aprobar");
        else navigate("/dashboard");

      } else {
        alert(data.error || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error("Error en login:", error);
      alert("Ocurrió un error");
    }
  };

  return (
    <AuthLayout>
      <div className="form-container">
        <h2 className="text-center mb-4">Iniciar Sesión - Universidad</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Correo institucional"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Entrar
          </button>
        </form>

        <p className="form-footer mt-4">
          ¿No tienes cuenta?{" "}
          <span className="form-link" onClick={() => navigate("/register")}>
            Regístrate aquí
          </span>
        </p>
        <p className="form-footer">
          <span className="form-link" onClick={() => navigate("/")}>
            ⬅ Volver a la página principal
          </span>
        </p>
      </div>
    </AuthLayout>
  );
}
