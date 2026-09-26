import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Card, Spinner, Form } from "react-bootstrap";

export default function DetallePracticaEmpresa() {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const [practica, setPractica] = useState(null);
  const [postulantes, setPostulantes] = useState([]);
  const [asignando, setAsignando] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPractica();
    fetchPostulantes();
  }, [id]);

  const fetchPractica = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/detalle-practica/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      setPractica(data);
    } catch (error) {
      console.error("Error al obtener práctica:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostulantes = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/postulantes-practica/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      setPostulantes(data);
    } catch (error) {
      console.error("Error al obtener postulantes:", error);
    }
  };

  const handleAsignar = async (userId) => {
    setAsignando(true);
    try {
      const res = await fetch(`http://localhost:8000/api/asignar-practicante/${id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ practicante_id: userId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Practicante asignado exitosamente.");
        fetchPractica();
      } else {
        alert(data.error || "No se pudo asignar practicante.");
      }
    } catch (error) {
      console.error("Error al asignar:", error);
    } finally {
      setAsignando(false);
    }
  };

  const handleEstado = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/actualizar-estado/${id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Estado actualizado correctamente.");
        fetchPractica();
      } else {
        alert(data.error || "Error al cambiar estado.");
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }
  };

  if (loading || !practica) return <Spinner animation="border" className="mt-4" />;

  return (
    <Card className="mt-4">
      <Card.Body>
        <Card.Title>{practica.titulo}</Card.Title>
        <Card.Text><strong>Estado:</strong> {practica.estado}</Card.Text>
        <Card.Text><strong>Descripción:</strong> {practica.descripcion}</Card.Text>

        <hr />
        <h5>Asignar Practicante</h5>
        {postulantes.length === 0 ? (
          <p>No hay postulantes para esta práctica.</p>
        ) : (
          <ul className="list-group">
            {postulantes.map((user) => (
              <li key={user.id} className="list-group-item d-flex justify-content-between align-items-center">
                {user.first_name} {user.last_name} ({user.email})
                <Button
                  variant="primary"
                  disabled={asignando}
                  onClick={() => handleAsignar(user.id)}
                >
                  Asignar
                </Button>
              </li>
            ))}
          </ul>
        )}

        <hr />
        <h5>Cambiar Estado</h5>
        <Form.Select className="mb-2" value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)}>
          <option value="">-- Selecciona un estado --</option>
          <option value="EN_CURSO">En curso</option>
          <option value="TERMINADA">Terminada</option>
        </Form.Select>
        <Button variant="success" onClick={handleEstado} disabled={!nuevoEstado}>Actualizar Estado</Button>
      </Card.Body>
    </Card>
  );
}
