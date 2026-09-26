import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Button, Spinner, Alert, Badge } from "react-bootstrap";

export default function DetallePracticasEvaluadasPorAprobar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [practica, setPractica] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const API = "http://localhost:8000";

  const cargarDetalle = async () => {
    setCargando(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/detalle-practica/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo cargar el detalle.");
      setPractica(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDetalle();
    // eslint-disable-next-line
  }, [id]);

  const cambiarEstado = async (nuevoEstado) => {
    setMensaje("");
    setError("");

    try {
      const res = await fetch(`${API}/api/actualizar-estado/${id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "No se pudo actualizar el estado.");
      }

      setMensaje(`Estado actualizado a ${nuevoEstado}`);
      await cargarDetalle(); // refresca
      // si quieres volver a la lista automáticamente:
      // setTimeout(() => navigate("/coordinador/practicas-evaluadas-por-aprobar"), 1200);
    } catch (e) {
      setError(e.message);
    }
  };

  if (cargando) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" />
        <p className="mt-2">Cargando detalle...</p>
      </Container>
    );
  }

  if (!practica) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">No se encontró la práctica.</Alert>
      </Container>
    );
  }

  // ✅ nombres “amigables” (sin romper si vienen null)
  const empresa = practica.empresa_nombre || "Sin empresa";
  const evaluador = practica.evaluador_nombre || "Sin evaluador";
  const practicante = practica.practicante_rut || (practica.practicante ? `ID ${practica.practicante}` : "Sin practicante");

  // ✅ archivo: normalmente viene en "informe_evaluacion"
  // si viene relativo, lo completo:
  const archivoUrl = practica.informe_evaluacion
    ? practica.informe_evaluacion.startsWith("http")
      ? practica.informe_evaluacion
      : `${API}${practica.informe_evaluacion}`
    : null;

  return (
    <Container className="mt-4" style={{ maxWidth: 900 }}>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="mb-0">Detalle Práctica Evaluada</h3>
        <Badge bg="secondary">Coordinador</Badge>
      </div>

      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm">
        <Card.Body>
          <h5 className="mb-3">{practica.titulo}</h5>

          <p><strong>Descripción:</strong> {practica.descripcion}</p>
          <p><strong>Estado:</strong> {practica.estado}</p>
          <p><strong>Empresa:</strong> {empresa}</p>
          <p><strong>Practicante:</strong> {practicante}</p>
          <p><strong>Evaluador:</strong> {evaluador}</p>

          <hr />

          <h5>Evaluación</h5>
          <p><strong>Nota:</strong> {practica.nota ?? "Sin nota"}</p>
          <p><strong>Comentarios:</strong> {practica.comentarios ?? "Sin comentarios"}</p>

          {archivoUrl ? (
            <Button
              variant="outline-primary"
              className="me-2"
              onClick={() => window.open(archivoUrl, "_blank")}
            >
              Ver archivo de evaluación
            </Button>
          ) : (
            <Alert variant="warning" className="mt-2">
              No hay archivo de evaluación subido.
            </Alert>
          )}

          <hr />

          {/* ✅ BOTONES DE ACCIÓN */}
          <div className="d-flex gap-2">
            <Button
              variant="success"
              onClick={() => cambiarEstado("APROBADA")}
              disabled={practica.estado === "APROBADA"}
            >
              Aprobar (APROBADA)
            </Button>

            <Button
              variant="danger"
              onClick={() => cambiarEstado("RECHAZADA")}
            >
              Rechazar
            </Button>

            <Button variant="secondary" onClick={() => navigate(-1)}>
              Volver
            </Button>
          </div>

          {/* ✅ Mensaje útil si ya está aprobada */}
          {practica.estado === "APROBADA" && (
            <Alert variant="info" className="mt-3 mb-0">
              Esta práctica ya fue aprobada por el coordinador.
            </Alert>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
