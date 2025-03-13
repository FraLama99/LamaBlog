import React, { useState, useEffect } from "react";
import { Button, Container, Form, Alert } from "react-bootstrap";
import { useAuth } from "../../utils/AuthContext"; // Aggiungi questo import
import "./styles.css";

const initialState = {
  title: "",
  category: "Tech",
  cover: "",
  content: "",
  readTime: {
    value: 1,
    unit: "minuti",
  },
};

const NewBlogPost = () => {
  const [formData, setFormData] = useState(initialState);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Sposta qui la dichiarazione

  const resetForm = () => {
    setFormData(initialState);
    // Reset anche il campo file se presente
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "readTime") {
      setFormData((prev) => ({
        ...prev,
        readTime: { ...prev.readTime, value: parseInt(value) || 1 },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("cover", file);

    setFormData((prev) => ({
      ...prev,
      cover: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setError("");
    setIsLoading(true); // Imposta loading a true all'inizio

    try {
      const token = localStorage.getItem("token");
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const userId = decodedToken.id;

      if (!userId) {
        setError("Utente non autenticato");
        setIsLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("category", formData.category);
      formDataToSend.append("title", formData.title);
      formDataToSend.append("content", formData.content);
      formDataToSend.append("author", userId);

      if (formData.cover) {
        formDataToSend.append("cover", formData.cover);
      }

      formDataToSend.append(
        "readTime",
        JSON.stringify({
          value: formData.readTime.value,
          unit: "minutes",
        })
      );

      const response = await fetch(
        process.env.REACT_APP_API_BASE_URL + "/blogPost",
        {
          method: "POST",
          body: formDataToSend,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage("Post creato con successo!");
        resetForm();
        await new Promise((resolve) => setTimeout(resolve, 3000));
        window.location.href = "/";
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      console.error("Errore:", error);
      setError(error.message || "Errore durante la creazione del post");
    } finally {
      setIsLoading(false); // Imposta sempre loading a false alla fine
    }
  };

  return (
    <Container className="new-blog-container">
      {successMessage && (
        <Alert variant="success" className="mt-1">
          {successMessage}
        </Alert>
      )}
      {error && (
        <Alert variant="danger" className="mt-1">
          {error}
        </Alert>
      )}
      <Form className="mt-1 pt-1" onSubmit={handleSubmit}>
        <Form.Group className="mt-3">
          <Form.Label>Titolo</Form.Label>
          <Form.Control
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Form.Group className="mt-3">
          <Form.Label>Categoria</Form.Label>
          <Form.Select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
          >
            <option>Tech</option>
            <option>Social</option>
            <option>NEWS</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mt-3">
          <Form.Label>Cover</Form.Label>
          <Form.Control
            type="file"
            onChange={handleFileChange}
            accept="image/*"
          />
        </Form.Group>

        <Form.Group className="mt-3">
          <Form.Label>Tempo di lettura (minuti)</Form.Label>
          <Form.Control
            type="number"
            name="readTime"
            min="1"
            value={formData.readTime.value}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Form.Group className="mt-3">
          <Form.Label>Contenuto Blog</Form.Label>
          <Form.Control
            as="textarea"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            style={{ minHeight: "200px" }}
            required
          />
        </Form.Group>

        <div className="d-flex gap-2 justify-content-end mt-3">
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? "Pubblicazione in corso..." : "Pubblica Post"}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default NewBlogPost;
