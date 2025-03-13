import { useState, useEffect } from "react";
import { Container, Form, Button /* Row, Col, Card  */ } from "react-bootstrap";
/* import { Editor } from "react-draft-wysiwyg"; */
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "./styles.css";
/* import { convertToRaw, EditorState } from "draft-js";
import draftToHtml from "draftjs-to-html"; */

const Registrazione = () => {
  const [authors, setAuthors] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newAuthor, setNewAuthor] = useState({
    name: "",
    surname: "",
    email: "",
    birth_date: "",
    avatar: "",
    password: "", // aggiungi il campo password
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAuthor((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verifica che le password coincidano
    if (newAuthor.password !== confirmPassword) {
      alert("Le password non coincidono");
      return;
    }

    await createAuthor(newAuthor);
    // Reset form
    setNewAuthor({
      name: "",
      surname: "",
      email: "",
      birth_date: "",
      avatar: "",
      password: "",
    });
    setConfirmPassword("");
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
      const formData = new FormData();

      // Verifica che i campi obbligatori non siano vuoti
      if (
        !authorData.name ||
        !authorData.surname ||
        !authorData.email ||
        !authorData.birth_date ||
        !authorData.password // Aggiungi controllo password
      ) {
        throw new Error("Tutti i campi sono obbligatori");
      }

      // Aggiungi i dati al FormData
      formData.append("name", authorData.name.trim());
      formData.append("surname", authorData.surname.trim());
      formData.append("email", authorData.email.trim());
      formData.append("birth_date", authorData.birth_date);
      formData.append("password", authorData.password); // Aggiungi password al FormData

      if (authorData.avatar instanceof File) {
        formData.append("avatar", authorData.avatar);
        console.log("File da caricare:", authorData.avatar);
      }

      const response = await fetch(
        process.env.REACT_APP_API_BASE_URL + "/authors",
        {
          method: "POST",
          body: formData,
        }
      );

      // Verifica prima il content-type della risposta
      const contentType = response.headers.get("content-type");
      if (!response.ok) {
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();
      console.log("Risposta dal server:", data);
      fetchAuthors();
    } catch (error) {
      console.error("Errore durante il caricamento:", error);
      alert(error.message); // Mostra l'errore all'utente
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
    <Container className="new-blog-container">
      <h2 className="mt-5">Aggiungi Nuovo Autore</h2>
      <Form
        onSubmit={handleSubmit}
        className="mb-4"
        encType="multipart/form-data"
      >
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
            type="file"
            name="avatar"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                console.log("File selezionato:", file);
                setNewAuthor((prev) => ({
                  ...prev,
                  avatar: file,
                }));
              }
            }}
            accept="image/*"
          />
        </Form.Group>
        <Form.Group className="mb-3 position-relative">
          <Form.Control
            type={showPassword ? "text" : "password"}
            name="password"
            value={newAuthor.password}
            onChange={handleInputChange}
            placeholder="Password"
            required
          />
          <i
            className={`bi bi-eye${
              showPassword ? "-slash" : ""
            } position-absolute end-0 top-50 translate-middle-y me-2`}
            onClick={() => setShowPassword(!showPassword)}
            style={{ cursor: "pointer" }}
          />
        </Form.Group>

        <Form.Group className="mb-3 position-relative">
          <Form.Control
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Conferma Password"
            required
            isInvalid={
              confirmPassword && confirmPassword !== newAuthor.password
            }
          />
          <i
            className={`bi bi-eye${
              showConfirmPassword ? "-slash" : ""
            } position-absolute end-0 top-50 translate-middle-y me-2`}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={{ cursor: "pointer" }}
          />
          <Form.Control.Feedback type="invalid">
            Le password non coincidono
          </Form.Control.Feedback>
        </Form.Group>

        <Button variant="primary" type="submit">
          Aggiungi Autore
        </Button>
      </Form>
    </Container>
  );
};

export default Registrazione;
