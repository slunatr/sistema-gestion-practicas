import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Button, ListGroup, Spinner, Form } from "react-bootstrap";

export default function DetallePracticaCoordinador() {
  const { id } = useParams();
  const [practica, setPractica] = useState(null);
  const [postulantes, setPostulantes] = useState([]);
  const [evaluador, setEvaluador] = useState("");
  const [evaluadores, setEvaluadores] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchPractica();
    fetchPostulantes();
    fetchEvaluadores();
  }, [id]);

  const fetchPractica = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/detalle-practica/${id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      const data = await res.json();
      setPractica(data);
    } catch (error) {
      console.error("Error al obtener práctica:", error);
    }
  };

  const fetchPostulantes = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/postulantes-practica/${id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      const data = await res.json();
      setPostulantes(data);
    } catch (error) {
      console.error("Error al obtener postulantes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvaluadores = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/usuarios-institucionales/?rol=EVAL`, {
        headers: { Authorization: `Token ${token}` }
      });
      const data = await res.json();
      setEvaluadores(data);
    } catch (error) {
      console.error("Error al obtener evaluadores:", error);
    }
  };

  const aprobarPostulacion = async (postulacionId) => {
    if (!window.confirm("¿Aprobar esta postulación?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/aprobar-postulacion/${postulacionId}/`, {
        method: "PATCH",
        headers: { Authorization: `Token ${token}` }
      });
      if (res.ok) {
        alert("Postulación aprobada.");
        fetchPostulantes();
      } else {
        const data = await res.json();
        alert(data.error || "Error al aprobar.");
      }
    } catch (error) {
      console.error("Error al aprobar postulante:", error);
      alert("Error al aprobar postulante.");
    }
  };

  const asignarEvaluador = async () => {
    if (!evaluador) {
      alert("Selecciona un evaluador.");
      return;
    }
    try {
      const res = await fetch(`http://localhost:8000/api/actualizar-rol/${evaluador}/`, {
        method: "PATCH",
        headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ evaluador: evaluador })
      });
      if (res.ok) {
        alert("Evaluador asignado correctamente.");
      } else {
        const data = await res.json();
        alert(data.error || "Error al asignar evaluador.");
      }
    } catch (error) {
      console.error("Error al asignar evaluador:", error);
    }
  };

  if (loading) return <div className="text-center mt-4"><Spinner animation="border" /></div>;

  if (!practica) return <div className="text-danger text-center">Práctica no encontrada</div>;

  return (
    <div className="container mt-4">
      <Card>
        <Card.Body>
          <Card.Title>{practica.titulo}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">Estado: {practica.estado}</Card.Subtitle>
          <Card.Text>{practica.descripcion}</Card.Text>

          <h5>Postulantes:</h5>
          {postulantes.length === 0 ? (
            <p>No hay postulantes registrados.</p>
          ) : (
            <ListGroup>
              {postulantes.map((p) => (
                <ListGroup.Item key={p.postulacion_id} className="d-flex justify-content-between align-items-center">
                  {p.nombre} ({p.rut})
                  {!p.aprobada && (
                    <Button variant="primary" size="sm" onClick={() => aprobarPostulacion(p.postulacion_id)}>
                      Aprobar
                    </Button>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}

          <hr />
          <h5>Asignar Evaluador:</h5>
          <Form.Select
            value={evaluador}
            onChange={(e) => setEvaluador(e.target.value)}
          >
            <option value="">Seleccionar evaluador</option>
            {evaluadores.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.first_name} {ev.last_name}</option>
            ))}
          </Form.Select>
          <Button className="mt-2" onClick={asignarEvaluador}>Asignar Evaluador</Button>
        </Card.Body>
      </Card>
    </div>
  );
}