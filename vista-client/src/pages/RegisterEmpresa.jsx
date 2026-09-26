import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Style/Form.css";

export default function RegisterEmpresa() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    rut: "",
    first_name: "",
    last_name: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [isError, setIsError] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password || !form.rut) {
      setMensaje("Todos los campos son obligatorios.");
      setIsError(true);
      setShowModal(true);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/register-empresa/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje("Cuenta creada exitosamente.");
        setIsError(false);
        setRegistroExitoso(true);
        setShowModal(true);
      } else {
        console.log("Error detallado del backend:", data);
        if (data.error?.includes("RUT")) {
          setMensaje("Ya existe un perfil registrado con ese RUT.");
        } else if (data.error?.includes("correo")) {
          setMensaje("Ya existe una cuenta con ese correo.");
        } else {
          setMensaje(data.error || "Error al registrarse como empresa.");
        }
        setIsError(true);
        setRegistroExitoso(false);
        setShowModal(true);
      }
    } catch (error) {
      setMensaje("Error de conexión con el servidor.");
      setIsError(true);
      setShowModal(true);
    }
  };

  return (
    <div className="form-background">
      <div className="form-overlay">
        <h2 className="text-center mb-4">Registro Empresa</h2>
        <form onSubmit={handleSubmit}>
          <input name="first_name" className="form-control mb-3" placeholder="Nombre representante" onChange={handleChange} required />
          <input name="last_name" className="form-control mb-3" placeholder="Apellido representante" onChange={handleChange} required />
          <input name="email" className="form-control mb-3" placeholder="Correo empresa" onChange={handleChange} required />
          <input name="rut" className="form-control mb-3" placeholder="RUT empresa" onChange={handleChange} required />
          <input type="password" name="password" className="form-control mb-3" placeholder="Contraseña" onChange={handleChange} required />
          <button type="submit" className="btn btn-success w-100">Registrar Empresa</button>
        </form>

        <p className="form-footer mt-4">
          ¿Ya estás registrada?{" "}
          <span className="form-link" onClick={() => navigate("/login-empresa")}>
            Inicia sesión aquí
          </span>
        </p>

        {showModal && (
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "#00000080" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className={`modal-content ${isError ? 'border-danger' : 'border-success'}`}>
                <div className={`modal-header ${isError ? 'bg-danger' : 'bg-success'}`}>
                  <h5 className="modal-title text-white">
                    {isError ? "Error" : "Registro exitoso"}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body text-center">
                  <p>{mensaje}</p>
                  {registroExitoso && (
                    <button
                      className="btn btn-primary mt-2"
                      onClick={() => {
                        setShowModal(false);
                        navigate("/login-empresa");
                      }}
                    >
                      Iniciar sesión
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}