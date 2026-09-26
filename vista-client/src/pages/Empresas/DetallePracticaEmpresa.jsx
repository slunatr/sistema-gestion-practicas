import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Button,
  Spinner,
  Row,
  Col,
  Form,
  Alert,
} from "react-bootstrap";

export default function DetallePracticaEmpresa() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [practica, setPractica] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [postulantes, setPostulantes] = useState([]);
  const [practicanteSeleccionado, setPracticanteSeleccionado] = useState("");
  const [documento, setDocumento] = useState(null);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [detalleRes, postulantesRes] = await Promise.all([
          fetch(`http://localhost:8000/api/detalle-practica/${id}/`, {
            headers: { Authorization: `Token ${token}` },
          }),
          fetch(`http://localhost:8000/api/postulantes-aprobados/${id}/`, {
            headers: { Authorization: `Token ${token}` },
          }),
        ]);

        const detalleData = await detalleRes.json();
        const postulantesData = await postulantesRes.json();

        setPractica(detalleData);
        setPostulantes(postulantesData);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchData();
  }, [id]);

  const cambiarEstado = async (nuevoEstado) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/actualizar-estado/${id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );

      if (res.ok) {
        setPractica({ ...practica, estado: nuevoEstado });
        setMensaje("Estado actualizado correctamente.");
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Error al cambiar estado");
      }
    } catch (err) {
      console.error("Error al cambiar estado:", err);
    }
  };

  const asignarPracticante = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/asignar-practicante/${id}/${practicanteSeleccionado}/`,
        {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (res.ok) {
        alert("Practicante asignado correctamente");
      } else {
        alert("Error al asignar practicante");
      }
    } catch (err) {
      console.error("Error al asignar practicante:", err);
    }
  };

  const subirDocumento = async () => {
    const formData = new FormData();
    formData.append("documentos", documento);

    try {
      const res = await fetch(
        `http://localhost:8000/api/detalle-practica/${id}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Token ${token}`,
          },
          body: formData,
        }
      );

      if (res.ok) {
        alert("Documento subido correctamente");
      } else {
        alert("Error al subir documento");
      }
    } catch (error) {
      console.error("Error al subir documento:", error);
    }
  };

  if (cargando) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!practica) {
    return <Container className="mt-5">No se encontró la práctica</Container>;
  }

  return (
    <Container className="mt-4">
      <h2>Detalle de Práctica</h2>
      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <strong>Título:</strong> {practica.titulo}
            </Col>
            <Col md={6}>
              <strong>Estado:</strong> {practica.estado}
            </Col>
          </Row>
          <Row className="mt-2">
            <Col md={12}>
              <strong>Descripción:</strong> {practica.descripcion}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {["ASIGNADA", "EN_CURSO"].includes(practica.estado) && (
        <div className="mb-3">
          <h5>Cambiar Estado</h5>
          {practica.estado === "ASIGNADA" && (
            <Button
              variant="warning"
              onClick={() => cambiarEstado("EN_CURSO")}
              className="me-2"
            >
              Marcar como En Curso
            </Button>
          )}
          {practica.estado === "EN_CURSO" && (
            <Button variant="success" onClick={() => cambiarEstado("TERMINADA")}>
              Finalizar Práctica
            </Button>
          )}
        </div>
      )}

      <div className="mb-4">
        <h5>Asignar Practicante</h5>
        <Form.Select
          className="mb-2"
          onChange={(e) => setPracticanteSeleccionado(e.target.value)}
          value={practicanteSeleccionado}
        >
          <option value="">Selecciona un postulante</option>
          {postulantes.map((postulante) => (
            <option key={postulante.id} value={postulante.id}>
              {postulante.nombre} - {postulante.rut}
            </option>
          ))}
        </Form.Select>
        <Button onClick={asignarPracticante} disabled={!practicanteSeleccionado}>
          Asignar Practicante
        </Button>
      </div>

      <div>
        <h5>Subir Documento</h5>
        <Form.Control
          type="file"
          className="mb-2"
          onChange={(e) => setDocumento(e.target.files[0])}
        />
        <Button onClick={subirDocumento} disabled={!documento}>
          Subir
        </Button>
      </div>
    </Container>
  );
}
