import React from "react";
import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import { Container, Row, Col } from "react-bootstrap";

const Layout = ({ children, user }) => {
  const rol = user?.rol || "PRACT";

  return (
    <div className="bg-white">
      <Header user={user} />
      <Row className="g-0">
        <Col md={3}>
          <Sidebar rol={rol} />
        </Col>
        <Col md={9}>
          <Container className="mt-4">{children}</Container>
        </Col>
      </Row>
    </div>
  );
};

export default Layout;