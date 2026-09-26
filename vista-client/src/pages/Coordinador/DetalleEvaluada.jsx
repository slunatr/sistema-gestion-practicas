import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Card, Button, Spinner, Row, Col, Modal } from "react-bootstrap";

export default function DetalleEvaluada() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [practica, setPractica] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState({ mostrar: false, accion: null });

  useEffect(() => {
    const obtenerDetalle = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/practicas/${id}/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setPractica(response.data);
      } catch (error) {
        console.error("Error al obtener detalle de la práctica", error);
      } finally {
        setCargando(false);
      }
    };
    obtenerDetalle();
  }, [id]);

  const confirmarCambio = async (nuevoEstado) => {
    try {
      await axios.patch(`http://localhost:8000/api/actualizar_estado_practica/${id}/`, {
        estado: nuevoEstado,
      }, {
        headers: { Authorization: `Token ${token}` },
      });
      navigate("/practicas-evaluadas-aprobar");
    } catch (error) {
      console.error("Error al cambiar estado", error);
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
      <h2 className="mb-4">Detalle de Práctica Evaluada</h2>
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}><strong>Título:</strong> {practica.titulo}</Col>
            <Col md={6}><strong>Empresa:</strong> {practica.empresa_nombre}</Col>
          </Row>
          <Row className="mt-2">
            <Col md={6}><strong>Practicante:</strong> {practica.practicante_nombre}</Col>
            <Col md={6}><strong>Estado:</strong> {practica.estado}</Col>
          </Row>
          <Row className="mt-2">
            <Col md={6}><strong>Fecha Inicio:</strong> {practica.fecha_inicio}</Col>
            <Col md={6}><strong>Fecha Término:</strong> {practica.fecha_termino}</Col>
          </Row>
          <Row className="mt-2">
            <Col md={12}><strong>Descripción:</strong> {practica.descripcion}</Col>
          </Row>
          <Row className="mt-2">
            <Col md={6}><strong>Nota:</strong> {practica.nota}</Col>
          </Row>
        </Card.Body>
      </Card>

      <div className="d-flex gap-3">
        <Button variant="success" onClick={() => setModal({ mostrar: true, accion: 'APROBADA' })}>
          Aprobar Práctica
        </Button>
        <Button variant="danger" onClick={() => setModal({ mostrar: true, accion: 'RECHAZADA' })}>
          Rechazar Práctica
        </Button>
      </div>

      <Modal show={modal.mostrar} onHide={() => setModal({ mostrar: false, accion: null })} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar acción</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás segura que deseas {modal.accion === 'APROBADA' ? 'aprobar' : 'rechazar'} esta práctica?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModal({ mostrar: false, accion: null })}>Cancelar</Button>
          <Button variant="primary" onClick={() => confirmarCambio(modal.accion)}>Confirmar</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
