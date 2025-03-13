import React, { useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import BlogList from "../../components/blog/blog-list/BlogList";
import "./styles.css";

const Home = ({ searchQuery }) => {
  const isLoggedIn = localStorage.getItem("token");
  const [currentPage] = useState(1);
  const postsPerPage = 10;

  return (
    <Container fluid="sm">
      {isLoggedIn ? (
        <>
          <h1 className="blog-main-title mb-3">Benvenuto sullo Strive Blog!</h1>
          <BlogList
            searchQuery={searchQuery}
            page={currentPage}
            perPage={postsPerPage}
          />
        </>
      ) : (
        // Contenuto per utenti non autenticati
        <Row className="justify-content-center mt-5 min-vh-100">
          <Col xs={12} md={8} className="text-center">
            <h1 className="mb-4">Benvenuto su Strive Blog</h1>
            <p className="mb-4">
              Per accedere ai contenuti del sito, effettua il login o
              registrati.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Link to="/login">
                <Button variant="dark">Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="outline-dark">Registrati</Button>
              </Link>
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Home;
