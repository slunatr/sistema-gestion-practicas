import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Button, Spinner, Alert, Badge } from "react-bootstrap";

function badgeVariant(estado) {
  switch (estado) {
    case "PENDIENTE": return "secondary";
    case "PUBLICADA": return "primary";
    case "POR_REVISAR": return "warning";
    case "ASIGNADA": return "info";
    case "EN_CURSO": return "info";
    case "TERMINADA": return "dark";
    case "EVALUADA": return "warning";
    case "APROBADA": return "success";
    case "RECHAZADA": return "danger";
    default: return "secondary";
  }
}

export default function DetallePracticaCoor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const API = "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [practica, setPractica] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const cargar = async () => {
    setCargando(true);
    setError("");
    setMensaje("");

    try {
      const res = await fetch(`${API}/api/detalle-practica/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.detail || "No se pudo cargar el detalle.");
      setPractica(data);
    } catch (e) {
      setError(e.message);
      setPractica(null);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line
  }, [id]);

  const cambiarEstado = async (nuevoEstado) => {
    setError("");
    setMensaje("");

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

      if (!res.ok) throw new Error(data?.error || "No se pudo actualizar el estado.");
      setMensaje(`Estado actualizado a ${nuevoEstado}`);
      await cargar();
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

  const archivoUrl = practica.informe_evaluacion
    ? practica.informe_evaluacion.startsWith("http")
      ? practica.informe_evaluacion
      : `${API}${practica.informe_evaluacion}`
    : null;

  const estado = practica.estado;

  // ✅ reglas de botones según flujo
  const puedePublicar = estado === "PENDIENTE";
  const puedePorRevisar = estado === "PENDIENTE";
  const puedeAprobarEvaluacion = estado === "EVALUADA";
  const puedeRechazar = estado === "EVALUADA" || estado === "PENDIENTE";

  return (
    <Container className="mt-4" style={{ maxWidth: 950 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-0">Detalle de Práctica</h3>
          <small className="text-muted">Vista Coordinador</small>
        </div>
        <Badge bg="secondary">COORD</Badge>
      </div>

      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h5 className="mb-1">{practica.titulo}</h5>
              <div className="text-muted">ID: {practica.id}</div>
            </div>
            <Badge bg={badgeVariant(estado)} style={{ fontSize: 14 }}>
              {estado}
            </Badge>
          </div>

          <hr />

          <p><strong>Descripción:</strong> {practica.descripcion || "—"}</p>
          <p><strong>Empresa:</strong> {practica.empresa_nombre || "—"}</p>
          <p><strong>Practicante:</strong> {practica.practicante_rut || (practica.practicante ? `ID ${practica.practicante}` : "—")}</p>
          <p><strong>Evaluador:</strong> {practica.evaluador_nombre || "—"}</p>

          <hr />

          <h5 className="mb-2">Evaluación</h5>
          <p><strong>Nota:</strong> {practica.nota ?? "—"}</p>
          <p><strong>Comentarios:</strong> {practica.comentarios ?? "—"}</p>

          {archivoUrl ? (
            <Button variant="outline-primary" className="me-2" onClick={() => window.open(archivoUrl, "_blank")}>
              Ver archivo
            </Button>
          ) : (
            <Alert variant="warning">No hay archivo subido.</Alert>
          )}

          <hr />

          <div className="d-flex flex-wrap gap-2">
            {puedePublicar && (
              <Button variant="primary" onClick={() => cambiarEstado("PUBLICADA")}>
                Aprobar publicación (PUBLICADA)
              </Button>
            )}

            {puedePorRevisar && (
              <Button variant="warning" onClick={() => cambiarEstado("POR_REVISAR")}>
                Enviar a revisión (POR_REVISAR)
              </Button>
            )}

            {puedeAprobarEvaluacion && (
              <Button variant="success" onClick={() => cambiarEstado("APROBADA")}>
                Aprobar evaluación (APROBADA)
              </Button>
            )}

            {puedeRechazar && (
              <Button variant="danger" onClick={() => cambiarEstado("RECHAZADA")}>
                Rechazar (RECHAZADA)
              </Button>
            )}

            <Button variant="secondary" onClick={() => navigate(-1)}>
              Volver
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
