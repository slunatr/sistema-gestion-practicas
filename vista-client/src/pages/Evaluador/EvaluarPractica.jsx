import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Form, Button, Alert, Spinner, Card } from "react-bootstrap";

export default function EvaluarPractica() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [practica, setPractica] = useState(null);
  const [nota, setNota] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [informe, setInforme] = useState(null);

  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(false);

  /* ===============================
     CARGAR DETALLE DE LA PRÁCTICA
     =============================== */
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`http://localhost:8000/api/detalle-practica/${id}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("No se pudo cargar la práctica");
        }
        return res.json();
      })
      .then((data) => {
        setPractica(data);
        setCargando(false);
      })
      .catch((err) => {
        setMensaje(err.message);
        setError(true);
        setCargando(false);
      });
  }, [id]);

  /* ===============================
     ENVIAR EVALUACIÓN
     =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const formData = new FormData();

    // 🔑 IMPORTANTE: normalizar nota para DecimalField
    const notaLimpia = String(nota).trim().replace(",", ".");
    formData.append("nota", notaLimpia);
    formData.append("comentarios", comentarios || "");

    if (informe) {
      formData.append("informe_evaluacion", informe);
    }

    try {
      const res = await fetch(
        `http://localhost:8000/api/evaluar-practica/${id}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Token ${token}`,
            // ❌ NO poner Content-Type cuando usas FormData
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (res.ok) {
        setError(false);
        setMensaje("✅ Evaluación enviada correctamente.");
        setTimeout(() => navigate("/practicas-a-evaluar"), 1200);
      } else {
        setError(true);
        setMensaje(data?.error || "Error al enviar evaluación.");
      }
    } catch (err) {
      setError(true);
      setMensaje("Error de conexión con el servidor.");
    }
  };

  /* ===============================
     ESTADOS DE CARGA
     =============================== */
  if (cargando) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p className="mt-2">Cargando práctica...</p>
      </Container>
    );
  }

  if (!practica) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">No se encontró la práctica.</Alert>
      </Container>
    );
  }

  /* ===============================
     RENDER
     =============================== */
  return (
    <Container className="mt-4">
      <Card className="mb-4 shadow">
        <Card.Body>
          <Card.Title>{practica.titulo}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            Empresa: {practica.empresa_nombre}
          </Card.Subtitle>

          <Card.Text>
            <strong>Descripción:</strong> {practica.descripcion}
          </Card.Text>

          <Card.Text>
            <strong>Practicante:</strong>{" "}
            {practica.practicante
              ? `${practica.practicante.first_name} ${practica.practicante.last_name}`
              : "No asignado"}
          </Card.Text>

          <Card.Text>
            <strong>Fechas:</strong>{" "}
            {practica.fecha_inicio} – {practica.fecha_termino}
          </Card.Text>
        </Card.Body>
      </Card>

      <h4>Evaluar práctica</h4>

      {mensaje && (
        <Alert variant={error ? "danger" : "success"}>{mensaje}</Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nota (1.0 – 7.0)</Form.Label>
          <Form.Control
            type="number"
            step="0.1"
            min="1"
            max="7"
            required
            value={nota}
            onChange={(e) => setNota(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Comentarios</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Informe de evaluación (Word / PDF)</Form.Label>
          <Form.Control
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setInforme(e.target.files[0])}
          />
        </Form.Group>

        <Button type="submit" variant="success">
          Enviar evaluación
        </Button>
      </Form>
    </Container>
  );
}
