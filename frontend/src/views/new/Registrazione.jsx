import { useState, useEffect } from "react";
import { Container, Form, Button, Row, Col } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "./styles.css";
import { useAuth } from "../../utils/AuthContext";

const Registrazione = () => {
  const [authors, setAuthors] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  // Usa login invece di accedere direttamente a setLoggedIn e setUser
  const { login } = useAuth();

  const [newAuthor, setNewAuthor] = useState({
    name: "",
    surname: "",
    email: "",
    birth_date: "",
    avatar: "",
    password: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      console.log("Token salvato nel localStorage:", token);

      // Usa la funzione login invece di verifyToken
      login(token).then(() => {
        navigate("/", { replace: true });
      });
    }
  }, [location, navigate, login]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAuthor((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newAuthor.password !== confirmPassword) {
      alert("Le password non coincidono");
      return;
    }

    await createAuthor(newAuthor);
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

  const createAuthor = async (authorData) => {
    try {
      const formData = new FormData();

      if (
        !authorData.name ||
        !authorData.surname ||
        !authorData.email ||
        !authorData.birth_date ||
        !authorData.password
      ) {
        throw new Error("Tutti i campi sono obbligatori");
      }

      formData.append("name", authorData.name.trim());
      formData.append("surname", authorData.surname.trim());
      formData.append("email", authorData.email.trim());
      formData.append("birth_date", authorData.birth_date);
      formData.append("password", authorData.password);

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

      if (data.token) {
        localStorage.setItem("token", data.token);
        // Usa login invece di setLoggedIn e setUser
        await login(data.token);
      }

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Errore durante il caricamento:", error);
      alert(error.message);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const handleGoogleLogin = () => {
    // Salva lo stato corrente nell'URL o in sessionStorage se necessario
    sessionStorage.setItem("redirectAfterLogin", "true");
    localStorage.setItem("pendingGoogleAuth", "true");
    window.location.href = `${process.env.REACT_APP_API_BASE_URL}/authors/login-google`;
  };

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

        <Row className="mb-3 mt-4">
          <Col>
            <hr />
            <p className="text-center">oppure</p>
          </Col>
        </Row>

        <Button
          variant="light"
          type="button"
          onClick={handleGoogleLogin}
          className="w-100 d-flex justify-content-center align-items-center gap-2 border"
          style={{ height: "42px" }}
        >
          <img
            src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.0/icons/google.svg"
            alt="Google logo"
            style={{ width: "20px", height: "20px" }}
          />
          Registrati con Google
        </Button>

        <div className="mt-3">
          <Button variant="primary" type="submit" className="w-100">
            Aggiungi Autore
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default Registrazione;
