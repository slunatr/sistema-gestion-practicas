import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Spinner } from "react-bootstrap";

export default function DetallePractica() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [practica, setPractica] = useState(null);
  const [loading, setLoading] = useState(true);
  const [postulando, setPostulando] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const rol = user?.rol;

  useEffect(() => {
    const fetchPractica = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`http://localhost:8000/api/detalle-practica/${id}/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("No autorizado");
        }
        const data = await response.json();
        setPractica(data);
      } catch (error) {
        console.error("Error al obtener práctica:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPractica();
  }, [id]);

  const handlePostular = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Debes iniciar sesión para postular.");
      return;
    }

    setPostulando(true);
    try {
      const response = await fetch(`http://localhost:8000/api/postular-practica/${id}/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert("¡Postulación exitosa!");
        navigate("/mis-postulaciones");
      } else {
        alert(data.error || "No fue posible postular.");
      }
    } catch (error) {
      console.error("Error al postular:", error);
      alert("Error al postular.");
    } finally {
      setPostulando(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  }

  if (!practica) {
    return <div className="text-danger text-center">No se encontró la práctica.</div>;
  }

  return (
    <Card className="mt-4">
      <Card.Body>
        <Card.Title>{practica.titulo}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          Empresa: {practica.empresa_nombre || "Empresa desconocida"}
        </Card.Subtitle>
        <Card.Text><strong>Descripción:</strong> {practica.descripcion}</Card.Text>
        <Card.Text><strong>Fecha inicio:</strong> {practica.fecha_inicio}</Card.Text>
        <Card.Text><strong>Fecha término:</strong> {practica.fecha_termino}</Card.Text>
        <Card.Text><strong>Estado:</strong> {practica.estado}</Card.Text>

        {rol === "PRACT" && practica.estado === "PUBLICADA" && (
          <Button onClick={handlePostular} disabled={postulando}>
            {postulando ? "Postulando..." : "Postular a esta práctica"}
          </Button>
        )}
      </Card.Body>
    </Card>
  );
}
