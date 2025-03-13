import { useState, useEffect } from "react";
import { Container, Form, Button, Row, Col, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import { convertToRaw, EditorState } from "draft-js";
import draftToHtml from "draftjs-to-html";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const Authors = () => {
  const [authors, setAuthors] = useState([]);
  const [newAuthor, setNewAuthor] = useState({
    name: "",
    surname: "",
    email: "",
    birth_date: "",
    avatar: "",
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAuthor((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    createAuthor(newAuthor);
    // Reset form
    setNewAuthor({
      name: "",
      surname: "",
      email: "",
      birth_date: "",
      avatar: "",
    });
  };

  // GET - Recupera tutti gli autori
  const fetchAuthors = async () => {
    try {
      const response = await fetch(
        process.env.REACT_APP_API_BASE_URL + "/authors"
      );
      const data = await response.json();
      setAuthors(data);
    } catch (error) {
      console.error("Errore:", error);
    }
  };

  // POST - Crea un nuovo autore
  const createAuthor = async (authorData) => {
    try {
      const response = await fetch(
        process.env.REACT_APP_API_BASE_URL + "/authors",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(authorData),
        }
      );
      const data = await response.json();
      // Aggiorna la lista degli autori
      fetchAuthors();
    } catch (error) {
      console.error("Errore:", error);
    }
  };
  // DELETE - Elimina un autore
  const deleteAuthor = async (id) => {
    try {
      const response = await fetch(`REACT_APP_API_BASE_URL/authors/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        // Aggiorna la lista degli autori dopo l'eliminazione
        fetchAuthors();
      }
    } catch (error) {
      console.error("Errore durante l'eliminazione:", error);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  return (
    <Container className="my-4 mt-5 ">
      <Container className="my-4 mt-5 ">
        <h2>Aggiungi Nuovo Autore</h2>
        <Form onSubmit={handleSubmit} className="mb-4">
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              name="name"
              value={newAuthor.name}
              onChange={handleInputChange}
              placeholder="Nome"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              name="surname"
              value={newAuthor.surname}
              onChange={handleInputChange}
              placeholder="Cognome"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              type="email"
              name="email"
              value={newAuthor.email}
              onChange={handleInputChange}
              placeholder="Email"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              type="date"
              name="birth_date"
              value={newAuthor.birth_date}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              type="url"
              name="avatar"
              value={newAuthor.avatar}
              onChange={handleInputChange}
              placeholder="URL Avatar"
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            Aggiungi Autore
          </Button>
        </Form>

        <h2>Lista Autori</h2>
        <Row>
          {authors.map((author) => (
            <Col key={author._id} md={4} className="mb-3">
              <Card>
                <Card.Img
                  variant="top"
                  src={author.avatar}
                  alt={`${author.name} ${author.surname}`}
                />
                <Card.Body>
                  <Card.Title>
                    {author.name} {author.surname}
                  </Card.Title>
                  <Card.Text>{author.email}</Card.Text>
                  <Card.Text>
                    <small className="text-muted">
                      Data di nascita:{" "}
                      {new Date(author.birth_date).toLocaleDateString()}
                    </small>
                  </Card.Text>
                  <Button
                    variant="danger"
                    onClick={() => deleteAuthor(author._id)}
                  >
                    Elimina
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </Container>
  );
};

export default Authors;
