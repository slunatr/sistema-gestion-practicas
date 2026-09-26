import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table, Alert, Spinner, Button } from "react-bootstrap";

export default function MisPracticasPorRevisarEmpresa() {
  const [practicas, setPracticas] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);
  const token = localStorage.getItem("token");

  const cargarPracticas = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/mis-practicas-por-revisar/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setPracticas(res.data);
    } catch (err) {
      console.error("Error al cargar prácticas por revisar", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPracticas();
  }, []);

  return (
    <Container className="mt-4">
      <h4>Prácticas que requieren revisión</h4>
      {mensaje && <Alert variant="info">{mensaje}</Alert>}
      {cargando ? (
        <Spinner animation="border" />
      ) : practicas.length === 0 ? (
        <p>No hay prácticas por revisar en este momento.</p>
      ) : (
        <Table striped bordered hover responsive className="mt-3">
          <thead>
            <tr>
              <th>Título</th>
              <th>Fecha de creación</th>
              <th>Estado actual</th>
              <th>Acción sugerida</th>
            </tr>
          </thead>
          <tbody>
            {practicas.map((p) => (
              <tr key={p.id}>
                <td>{p.titulo}</td>
                <td>{new Date(p.creado_en).toLocaleDateString()}</td>
                <td>{p.estado}</td>
                <td>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => alert("Aquí puedes implementar la edición o reenvío.")}
                  >
                    Editar práctica
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
