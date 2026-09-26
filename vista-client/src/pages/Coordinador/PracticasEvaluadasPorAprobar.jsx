import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table, Button, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function PracticasEvaluadasPorAprobar() {
  const [practicas, setPracticas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const cargarPracticas = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/practicas-evaluadas-por-aprobar/",
          { headers: { Authorization: `Token ${token}` } }
        );
        setPracticas(Array.isArray(response.data) ? response.data : []);
      } catch (e) {
        setError("No se pudieron cargar las prácticas evaluadas por aprobar.");
        console.error(e);
      } finally {
        setCargando(false);
      }
    };

    cargarPracticas();
  }, [token]);

  if (cargando) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p className="mt-2">Cargando prácticas evaluadas...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Prácticas Evaluadas por Aprobar</h2>

      {practicas.length === 0 ? (
        <Alert variant="info">No hay prácticas evaluadas por aprobar.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>Título</th>
              <th>Empresa</th>
              <th>Practicante</th>
              <th>Evaluador</th>
              <th>Nota</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {practicas.map((p) => (
              <tr key={p.id}>
                <td>{p.titulo}</td>
                <td>{p.empresa_nombre || "—"}</td>
                <td>{p.practicante_rut || "—"}</td>
                <td>{p.evaluador_nombre || "—"}</td>
                <td>{p.nota ?? "—"}</td>
                <td>{p.estado}</td>
                <td>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => navigate(`/coordinador/practicas-evaluadas/${p.id}`)}
                  >
                    Ver Detalle
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
