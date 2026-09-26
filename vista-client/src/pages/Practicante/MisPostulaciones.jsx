import React, { useEffect, useState } from "react";
import { Container, ListGroup, Spinner } from "react-bootstrap";

export default function MisPostulaciones() {
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:8000/api/mis-postulaciones/", {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Postulaciones recibidas:", data);
        setPostulaciones(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar postulaciones:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Container className="mt-4">
      <h3>Mis Postulaciones</h3>
      {postulaciones.length === 0 ? (
        <p>No tienes postulaciones registradas.</p>
      ) : (
        <ListGroup>
          {postulaciones.map((p) => (
            <ListGroup.Item key={p.id}>
              <strong>{p.titulo}</strong> <br />
              Empresa: {p.empresa} <br />
              Estado de la práctica: {p.estado} <br />
              Fecha de postulación:{" "}
              {new Date(p.fecha_postulacion).toLocaleDateString()}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Container>
  );
}