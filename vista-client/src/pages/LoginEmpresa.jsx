import React, { useState } from "react";
import AuthLayout from "../componentes/AuthLayout";
import "../Style/Form.css";
import { useNavigate } from "react-router-dom";

export default function LoginEmpresa() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/api/login-empresa/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("rol", data.perfil.rol); // <- ESTO FALTABA
        navigate("/dashboard");
      } else {
        alert(data.error || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error("Error en login empresa:", error);
      alert("Ocurrió un error");
    }
  };

  return (
    <AuthLayout>
      <div className="form-container">
        <h2 className="text-center mb-4">Iniciar Sesión - Empresa</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            className="form-control mb-3"
            placeholder="Correo empresa"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="form-control mb-3"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary w-100">Entrar</button>
        </form>

        <p className="form-footer mt-4">
          ¿No estás registrado?{" "}
          <span className="form-link" onClick={() => navigate("/register-empresa")}>
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