
import React, { useEffect, useState } from "react";
import { Form, Button, Alert, Spinner, Image } from "react-bootstrap";

export default function PerfilUsuario() {
  const [perfil, setPerfil] = useState({});
  const [usuario, setUsuario] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/mi-perfil/", {
          headers: { Authorization: `Token ${token}` },
        });

        const data = await response.json();
        setPerfil(data.perfil);
        setUsuario(data.usuario);
        setCargando(false);
      } catch (err) {
        setError("Error al cargar perfil");
        setCargando(false);
      }
    };
    fetchPerfil();
  }, [token]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setPerfil({ ...perfil, [name]: files[0] });
    } else {
      setPerfil({ ...perfil, [name]: value });
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    const formData = new FormData();
    Object.entries(perfil).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    try {
      const response = await fetch("http://localhost:8000/api/mi-perfil/", {
        method: "PUT",
        headers: {
          Authorization: `Token ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setPerfil(data.perfil);
        setUsuario(data.usuario);
        setMensaje("Perfil actualizado correctamente");
        setEditando(false);
      } else {
        setError("Error al actualizar perfil");
      }
    } catch (err) {
      setError("Error en la solicitud");
    }
  };

  if (cargando) return <Spinner animation="border" className="m-4" />;

  const nombreRol = {
    ADMIN: "Administrador",
    COORD: "Coordinador",
    EVAL: "Evaluador",
    PRACT: "Practicante",
    EMPRESA: "Empresa",
  }[perfil.rol] || perfil.rol;

  return (
    <div className="container mt-4" style={{ maxWidth: "600px" }}>
      <h4 className="mb-4">Mi Perfil</h4>
      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      {perfil.foto && (
        <div className="text-center mb-4">
          <Image
            src={`http://localhost:8000${perfil.foto}`}
            roundedCircle
            style={{ width: "120px", height: "120px", objectFit: "cover" }}
          />
        </div>
      )}

      <Form onSubmit={handleGuardar}>
        <Form.Group className="mb-3">
          <Form.Label>Nombre</Form.Label>
          <Form.Control type="text" value={usuario.first_name || ""} readOnly />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Apellido</Form.Label>
          <Form.Control type="text" value={usuario.last_name || ""} readOnly />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>RUT</Form.Label>
          <Form.Control type="text" value={perfil.rut || ""} readOnly />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Rol</Form.Label>
          <Form.Control type="text" value={nombreRol} readOnly />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Nacionalidad</Form.Label>
          <Form.Control
            type="text"
            name="nacionalidad"
            value={perfil.nacionalidad || ""}
            onChange={handleChange}
            disabled={!editando}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Dirección</Form.Label>
          <Form.Control
            type="text"
            name="direccion"
            value={perfil.direccion || ""}
            onChange={handleChange}
            disabled={!editando}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Teléfono</Form.Label>
          <Form.Control
            type="text"
            name="telefono"
            value={perfil.telefono || ""}
            onChange={handleChange}
            disabled={!editando}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Foto de perfil</Form.Label>
          <Form.Control
            type="file"
            name="foto"
            accept="image/*"
            onChange={handleChange}
            disabled={!editando}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>CV</Form.Label>
          <Form.Control
            type="file"
            name="cv"
            accept=".pdf"
            onChange={handleChange}
            disabled={!editando}
          />
        </Form.Group>

        <div className="d-flex justify-content-between mt-4">
          <Button variant="secondary" onClick={() => setEditando(!editando)}>
            {editando ? "Cancelar" : "Editar Perfil"}
          </Button>
          <Button variant="primary" type="submit" disabled={!editando}>
            Guardar Cambios
          </Button>
        </div>
      </Form>
    </div>
  );
}