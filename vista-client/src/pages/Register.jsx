import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../componentes/AuthLayout";
import "../Style/Form.css";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    rut: "",
    first_name: "",
    last_name: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:8000/api/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    if (response.ok) {
      alert("Registro exitoso");
      navigate("/login");
    } else {
      alert(data.error || "Error al registrarse");
    }
  };

  return (
    <AuthLayout>
      <div className="form-container">
        <h2 className="text-center mb-4">Registro Usuario Institucional</h2>
        <form onSubmit={handleSubmit}>
          <input name="first_name" className="form-control mb-3" placeholder="Nombre" onChange={handleChange} required />
          <input name="last_name" className="form-control mb-3" placeholder="Apellido" onChange={handleChange} required />
          <input name="email" className="form-control mb-3" placeholder="Correo institucional" onChange={handleChange} required />
          <input name="rut" className="form-control mb-3" placeholder="RUT (XX.XXX.XXX-X)" onChange={handleChange} required />
          <input type="password" name="password" className="form-control mb-3" placeholder="Contraseña" onChange={handleChange} required />
          <button type="submit" className="btn btn-success w-100">Registrarse</button>
        </form>

        <p className="form-footer mt-4">
          ¿Ya tienes cuenta?{" "}
          <span className="form-link" onClick={() => navigate("/login")}>
            Inicia sesión aquí
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