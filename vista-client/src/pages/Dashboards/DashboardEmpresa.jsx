import React, { useEffect, useState } from "react";
import { Container, Card, Button, Badge } from "react-bootstrap";

export default function MisPracticasPublicadasEmpresa() {
  const [practicas, setPracticas] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:8000/api/mis-practicas-publicadas/", {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setPracticas(data))
      .catch((error) => console.error("Error al cargar prácticas:", error));
  }, []);

  const cambiarEstado = async (id, nuevoEstado) => {
    const confirm = window.confirm(`¿Estás seguro que deseas cambiar el estado a ${nuevoEstado}?`);
    if (!confirm) return;

    try {
      const response = await fetch(`http://localhost:8000/api/actualizar-estado/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (response.ok) {
        alert("Estado actualizado correctamente");
        // Recargar prácticas
        const data = await fetch("http://localhost:8000/api/mis-practicas-publicadas/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        }).then((res) => res.json());
        setPracticas(data);
      } else {
        const data = await response.json();
        alert(data.error || "Error al actualizar estado");
      }
    } catch (error) {
      console.error("Error actualizando estado:", error);
    }
  };

  const renderBotonesEstado = (practica) => {
    if (practica.estado === "ASIGNADA") {
      return (
        <Button
          variant="warning"
          size="sm"
          onClick={() => cambiarEstado(practica.id, "EN_CURSO")}
          className="me-2"
        >
          Marcar En Curso
        </Button>
      );
    } else if (practica.estado === "EN_CURSO") {
      return (
        <Button
          variant="success"
          size="sm"
          onClick={() => cambiarEstado(practica.id, "TERMINADA")}
        >
          Finalizar Práctica
        </Button>
      );
    }
    return null;
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Mis Prácticas Publicadas</h2>
      {practicas.length === 0 ? (
        <p>No has publicado prácticas aún.</p>
      ) : (
        practicas.map((practica) => (
          <Card className="mb-3 shadow-sm" key={practica.id}>
            <Card.Body>
              <Card.Title>{practica.titulo}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">
                Estado: <Badge bg="info">{practica.estado}</Badge>
              </Card.Subtitle>
              <Card.Text>
                <strong>Descripción:</strong> {practica.descripcion}<br />
                <strong>Fecha Inicio:</strong> {practica.fecha_inicio}<br />
                <strong>Fecha Término:</strong> {practica.fecha_termino}
              </Card.Text>
              {renderBotonesEstado(practica)}
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
}