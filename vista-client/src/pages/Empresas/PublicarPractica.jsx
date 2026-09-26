import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Alert } from "react-bootstrap";

export default function PublicarPractica() {
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    fecha_inicio: "",
    fecha_termino: "",
    requisitos: "",
  });
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setError(false);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:8000/api/publicar-practica/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMensaje("Práctica enviada para revisión.");
        setTimeout(() => navigate("/mis-practicas-publicadas"), 1500);
      } else {
        const data = await response.json();
        setMensaje("Error: " + (data.error || "No se pudo enviar la práctica"));
        setError(true);
      }
    } catch (err) {
      setMensaje("Error de conexión con el servidor.");
      setError(true);
    }
  };

  return (
    <Container className="mt-4">
      <h3>Publicar Nueva Práctica</h3>
      {mensaje && <Alert variant={error ? "danger" : "success"}>{mensaje}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Título</Form.Label>
          <Form.Control
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Requisitos</Form.Label>
          <Form.Control
            type="text"
            name="requisitos"
            value={formData.requisitos}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Fecha Inicio</Form.Label>
          <Form.Control
            type="date"
            name="fecha_inicio"
            value={formData.fecha_inicio}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Fecha Término</Form.Label>
          <Form.Control
            type="date"
            name="fecha_termino"
            value={formData.fecha_termino}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Button type="submit" variant="primary">
          Publicar
        </Button>
      </Form>
    </Container>
  );
}