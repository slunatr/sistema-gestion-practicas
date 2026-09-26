import React, { useEffect, useState } from "react";
import { Container, Table, Spinner, Alert, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function MisPracticasEvaluadas() {
  const [practicas, setPracticas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const cargar = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:8000/api/mis-practicas-evaluadas/", {
          headers: { Authorization: `Token ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.detail || data?.error || "Error al cargar.");
        setPracticas(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message);
        setPracticas([]);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  if (cargando) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" />
        <p className="mt-2">Cargando...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h3>Mis Prácticas Evaluadas</h3>
      {error && <Alert variant="danger">{error}</Alert>}

      {practicas.length === 0 ? (
        <Alert variant="info">Aún no has evaluado prácticas.</Alert>
      ) : (
        <Table striped bordered hover responsive className="mt-3">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Empresa</th>
              <th>Estado</th>
              <th>Nota</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {practicas.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.titulo}</td>
                <td>{p.empresa_nombre || "—"}</td>
                <td>{p.estado}</td>
                <td>{p.nota ?? "—"}</td>
                <td>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => navigate(`/detalle-practica/${p.id}`)}
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
