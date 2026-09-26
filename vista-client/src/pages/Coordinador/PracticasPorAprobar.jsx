import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table, Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function PracticasPorAprobar() {
  console.log("👀 El componente PracticasPorAprobar se está montando");

  const [practicas, setPracticas] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const cargarPracticas = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/practicas-pendientes/",
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      setPracticas(res.data);
      console.log("Datos recibidos del backend:", res.data);
    } catch (err) {
      console.error("Error al cargar prácticas pendientes", err);
    } finally {
      setCargando(false);
    }
  };

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      await axios.patch(
        `http://localhost:8000/api/actualizar-estado/${id}/`,
        { estado: nuevoEstado },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      setMensaje(`Práctica ${nuevoEstado.toLowerCase()} correctamente.`);
      cargarPracticas();
    } catch (err) {
      console.error("Error al actualizar estado", err);
      setMensaje("Hubo un error al actualizar el estado.");
    }
  };

  useEffect(() => {
    cargarPracticas();
  }, []);

  return (
    <Container className="mt-4">
      <h4>Prácticas Pendientes por Aprobar</h4>

      {mensaje && <Alert variant="info">{mensaje}</Alert>}

      {cargando ? (
        <Spinner animation="border" />
      ) : practicas.length === 0 ? (
        <p>No hay prácticas pendientes por aprobar.</p>
      ) : (
        <Table striped bordered hover responsive className="mt-3">
          <thead>
            <tr>
              <th>Título</th>
              <th>Empresa</th>
              <th>Fecha de creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {practicas.map((p) => (
              <tr key={p.id}>
                <td>{p.titulo}</td>
                <td>{p.empresa_nombre || "Empresa"}</td>
                <td>{new Date(p.creado_en).toLocaleDateString()}</td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    className="me-2"
                    onClick={() => navigate(`/detalle-practica/${p.id}`)}
                  >
                    Ver práctica
                  </Button>

                  <Button
                    variant="success"
                    size="sm"
                    className="me-2"
                    onClick={() => actualizarEstado(p.id, "PUBLICADA")}
                  >
                    Aprobar
                  </Button>

                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => actualizarEstado(p.id, "POR_REVISAR")}
                  >
                    Solicitar revisión
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
