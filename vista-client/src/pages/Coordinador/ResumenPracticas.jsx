import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Spinner, ListGroup } from "react-bootstrap";

export default function ResumenPracticas() {
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const obtenerResumen = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/resumen-practicas/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setResumen(response.data);
      } catch (error) {
        console.error("Error al obtener resumen de prácticas", error);
      } finally {
        setCargando(false);
      }
    };

    obtenerResumen();
  }, []);

  if (cargando) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4 text-center">📊 Resumen de Prácticas</h2>

      <Row className="mb-4">
        <Col md={4}>
          <Card bg="light" text="dark" className="shadow-sm">
            <Card.Body>
              <Card.Title>Total de prácticas</Card.Title>
              <h3 className="text-primary">{resumen.total_filtradas}</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card bg="light" text="dark" className="shadow-sm">
            <Card.Body>
              <Card.Title>Prácticas con nota ≥ 5.0</Card.Title>
              <h3 className="text-success">{resumen.practicas_con_nota_alta}</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card bg="light" text="dark" className="shadow-sm">
            <Card.Body>
              <Card.Title>Alumnos en práctica</Card.Title>
              <h3 className="text-warning">{resumen.alumnos_en_practica}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">Resumen por Estado</Card.Header>
            <ListGroup variant="flush">
              {resumen.resumen_por_estado.map((item, index) => (
                <ListGroup.Item key={index}>
                  <strong>{item.estado}</strong>: {item.total}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-success text-white">Resumen por Empresa</Card.Header>
            <ListGroup variant="flush">
              {resumen.resumen_por_empresa.map((item, index) => (
                <ListGroup.Item key={index}>
                  <strong>{item.empresa__username}</strong>: {item.total}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}