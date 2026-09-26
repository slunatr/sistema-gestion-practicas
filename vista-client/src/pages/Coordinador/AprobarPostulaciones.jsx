import React, { useEffect, useState } from "react";
import { Button, Card, Col, Container, Row } from "react-bootstrap";

export default function AprobarPostulaciones() {
  const [postulaciones, setPostulaciones] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:8000/api/postulaciones-por-aprobar/", {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setPostulaciones(data))
      .catch((err) => console.error("Error al obtener postulaciones:", err));
  }, []);

  const aprobarPostulacion = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:8000/api/aprobar-postulacion/${id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      if (res.ok) {
        alert("Postulación aprobada correctamente.");
        setPostulaciones((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("No se pudo aprobar la postulación.");
      }
    } catch (err) {
      console.error("Error al aprobar postulación:", err);
    }
  };

  return (
    <Container className="mt-4">
      <h2>Postulaciones por Aprobar</h2>
      <Row className="mt-3">
        {postulaciones.length > 0 ? (
          postulaciones.map((p) => (
            <Col md={6} lg={4} key={p.id}>
              <Card className="mb-3 shadow">
                <Card.Body>
                  <Card.Title>{p.titulo_practica}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    Empresa: {p.empresa}
                  </Card.Subtitle>
                  <Card.Text>
                    <strong>Nombre:</strong> {p.nombre} <br />
                    <strong>RUT:</strong> {p.rut || "No disponible"} <br />
                    <strong>Email:</strong> {p.email} <br />
                    <strong>Descripción:</strong> {p.descripcion_practica} <br />
                    <strong>Postulado el:</strong> {p.fecha_postulacion}
                  </Card.Text>
                  <Button variant="success" onClick={() => aprobarPostulacion(p.id)}>
                    Aprobar Postulación
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p>No hay postulaciones pendientes de aprobación.</p>
        )}
      </Row>
    </Container>
  );
}