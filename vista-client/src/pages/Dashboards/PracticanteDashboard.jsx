import React, { useEffect, useState } from "react";
import { Card, Container, Row, Col, Form } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PracticanteDashboard = () => {
  const [practicas, setPracticas] = useState([]);
  const [filtro, setFiltro] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://localhost:8000/api/practicas-disponibles/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      .then((res) => setPracticas(res.data))
      .catch((err) => console.error("Error al cargar prácticas", err));
  }, []);

  const practicasFiltradas = practicas.filter((p) =>
    p.titulo.toLowerCase().includes(filtro.toLowerCase())
  );

  const irADetalle = (id) => {
    navigate(`/detalle-practica/${id}`);
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Prácticas Disponibles</h2>

      <Form.Group controlId="buscarPractica" className="mb-3">
        <Form.Control
          type="text"
          placeholder="Buscar por título o empresa..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </Form.Group>

      <Row xs={1} md={2} lg={3} className="g-4">
        {practicasFiltradas.length > 0 ? (
          practicasFiltradas.map((p) => (
            <Col key={p.id}>
              <Card onClick={() => irADetalle(p.id)} style={{ cursor: "pointer" }}>
                <Card.Body>
                  <Card.Title>{p.titulo}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    Empresa: {p.empresa_nombre || "N/A"}
                  </Card.Subtitle>
                  <Card.Text>
                    <strong>Descripción:</strong> {p.descripcion}
                  </Card.Text>
                  <Card.Text>
                    <strong>Fecha inicio:</strong> {p.fecha_inicio}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p>No hay prácticas disponibles.</p>
        )}
      </Row>
    </Container>
  );
};

export default PracticanteDashboard;
