import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table, Button, Form, Row, Col } from "react-bootstrap";

export default function AsignarRoles() {
  const [usuarios, setUsuarios] = useState([]);
  const [cambios, setCambios] = useState({});
  const [busqueda, setBusqueda] = useState("");
  const [notificacion, setNotificacion] = useState(null);
  const [confirmar, setConfirmar] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/usuarios-institucionales/", {
        headers: { Authorization: `Token ${token}` },
      });
      setUsuarios(response.data);
    } catch (error) {
      console.error("Error al cargar usuarios", error);
    }
  };

  const mostrarNotificacion = (mensaje, tipo = 'success') => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion(null), 3000);
  };

  const handleRolChange = (userId, nuevoRol) => {
    setCambios({ ...cambios, [userId]: nuevoRol });
  };

  const confirmarCambioRol = (userId) => {
    const nuevoRol = cambios[userId];
    if (!nuevoRol) return;
    setConfirmar({ userId, nuevoRol });
  };

  const guardarCambios = async () => {
    const { userId, nuevoRol } = confirmar;
    try {
      await axios.put(`http://localhost:8000/api/actualizar-rol/${userId}/`, { rol: nuevoRol }, {
        headers: { Authorization: `Token ${token}` },
      });
      mostrarNotificacion("✅ Rol actualizado correctamente", "success");
      setCambios((prev) => {
        const copia = { ...prev };
        delete copia[userId];
        return copia;
      });
      setConfirmar(null);
      cargarUsuarios();
    } catch (error) {
      console.error("❌ Error al guardar cambios", error);
      mostrarNotificacion("❌ Error al actualizar el rol", "error");
      setConfirmar(null);
    }
  };

  const rolesDisponibles = [
    { valor: "PRACT", nombre: "Practicante" },
    { valor: "EVAL", nombre: "Evaluador" },
    { valor: "COORD", nombre: "Coordinador" },
    { valor: "ADMIN", nombre: "Administrador" },
  ];

  const usuariosFiltrados = usuarios.filter((u) =>
    u.first_name.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.last_name.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Container className="mt-4">
      <h2 className="mb-3">Asignar Roles</h2>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </Col>
      </Row>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol actual</th>
            <th>Nuevo rol</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {usuariosFiltrados.map((usuario) => (
            <tr key={usuario.id}>
              <td>{usuario.first_name} {usuario.last_name}</td>
              <td>{usuario.email}</td>
              <td>{rolesDisponibles.find((r) => r.valor === usuario.rol)?.nombre || "Desconocido"}</td>
              <td>
                <Form.Select
                  value={cambios[usuario.id] || usuario.rol || ""}
                  onChange={(e) => handleRolChange(usuario.id, e.target.value)}
                >
                  {rolesDisponibles.map((rol) => (
                    <option key={rol.valor} value={rol.valor}>{rol.nombre}</option>
                  ))}
                </Form.Select>
              </td>
              <td>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => confirmarCambioRol(usuario.id)}
                  disabled={!cambios[usuario.id] || cambios[usuario.id] === usuario.rol}
                >
                  Guardar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Confirmación centrada */}
      {confirmar && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '1.5rem 2rem',
          borderRadius: '8px',
          boxShadow: '0 0 10px rgba(0,0,0,0.3)',
          zIndex: 9999,
          textAlign: 'center'
        }}>
          <p>¿Estás segura que deseas cambiar el rol?</p>
          <div className="d-flex justify-content-center mt-3">
            <Button variant="success" className="me-2" onClick={guardarCambios}>Sí, cambiar</Button>
            <Button variant="secondary" onClick={() => setConfirmar(null)}>Cancelar</Button>
          </div>
        </div>
      )}

      {/* Notificación centrada */}
      {notificacion && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: notificacion.tipo === 'success' ? '#d4edda' : '#f8d7da',
          color: notificacion.tipo === 'success' ? '#155724' : '#721c24',
          padding: '1rem 2rem',
          borderRadius: '8px',
          boxShadow: '0 0 10px rgba(0,0,0,0.3)',
          zIndex: 9999,
          textAlign: 'center'
        }}>
          {notificacion.mensaje}
        </div>
      )}
    </Container>
  );
}
