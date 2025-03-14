import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Card,
  Spinner,
} from "react-bootstrap";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import axios from "axios";
import { useAuth } from "../../../utils/AuthContext";
import { Link } from "react-router-dom";

const Profile = () => {
  // Stati per la gestione del profilo
  const { isAuthenticated, getToken } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    birth_date: "",
    avatar: null,
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [userPosts, setUserPosts] = useState([]);

  // Recupera i dati dell'utente dal server
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = getToken();

      if (!token) {
        setError("Token non disponibile. Effettua il login.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/authors/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(response.data);
      setFormData({
        name: response.data.name,
        surname: response.data.surname,
        email: response.data.email,
        birth_date: response.data.birth_date
          ? response.data.birth_date.split("T")[0]
          : "",
        avatar: null,
      });

      // Recupera i post dell'utente
      fetchUserPosts(response.data._id, token);

      setLoading(false);
    } catch (err) {
      console.error("Errore:", err);
      setError(
        "Errore nel recupero dei dati utente. Verifica di essere loggato."
      );
      setLoading(false);
    }
  };

  // Recupera i post dell'utente
  const fetchUserPosts = async (userId, token) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/authors/${userId}/blogPosts`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserPosts(response.data);
    } catch (err) {
      console.error("Errore nel recupero dei post:", err);
    }
  };

  // Effetto per caricare i dati dell'utente quando il componente si monta
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
    } else {
      setError("Effettua il login per visualizzare il tuo profilo");
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Gestisce i cambiamenti nei campi del form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Gestisce il caricamento dell'immagine
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        avatar: file,
      }));

      // Crea una preview dell'immagine
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Gestisce l'invio del form per l'aggiornamento del profilo
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = getToken();

      // Aggiorna i dati del profilo
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/authors/${user._id}`,
        {
          name: formData.name,
          surname: formData.surname,
          email: formData.email,
          birth_date: formData.birth_date,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Se c'è una nuova immagine, caricala
      if (formData.avatar) {
        const avatarFormData = new FormData();
        avatarFormData.append("avatar", formData.avatar);

        await axios.patch(
          `${process.env.REACT_APP_API_BASE_URL}/authors/${user._id}/avatar`,
          avatarFormData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      // Recupera i dati aggiornati
      await fetchUserData();

      setEditing(false);
      setNotification({
        show: true,
        type: "success",
        message: "Profilo aggiornato con successo!",
      });

      setTimeout(() => {
        setNotification({ show: false, type: "", message: "" });
      }, 3000);
    } catch (err) {
      console.error("Errore:", err);
      setNotification({
        show: true,
        type: "danger",
        message: `Errore durante l'aggiornamento: ${
          err.response?.data?.message || err.message
        }`,
      });
    } finally {
      setLoading(false);
    }
  };

  // Formatta la data
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: it });
    } catch (error) {
      return dateString;
    }
  };

  if (loading && !user) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "70vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5 pt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5 pt-5">
      <h1 className="text-center mb-4">Il Mio Profilo</h1>

      {notification.show && (
        <Alert
          variant={notification.type}
          onClose={() =>
            setNotification({ show: false, type: "", message: "" })
          }
          dismissible
        >
          {notification.message}
        </Alert>
      )}

      {!editing ? (
        <Card className="profile-card">
          <Card.Body>
            <Row>
              <Col md={4} className="text-center mb-3">
                <div className="avatar-container">
                  <img
                    src={user?.avatar}
                    alt="Avatar utente"
                    className="img-fluid rounded-circle avatar"
                    style={{
                      width: "150px",
                      height: "150px",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/150?text=Avatar";
                    }}
                  />
                </div>
              </Col>
              <Col md={8}>
                <h2 className="user-fullname">
                  {user?.name} {user?.surname}
                </h2>
                <p className="user-email">
                  <strong>Email:</strong> {user?.email}
                </p>
                <p className="user-birthdate">
                  <strong>Data di nascita:</strong>{" "}
                  {formatDate(user?.birth_date)}
                </p>
                <Button
                  variant="primary"
                  onClick={() => setEditing(true)}
                  className="mt-3"
                >
                  <i className="bi bi-pencil-square me-1"></i> Modifica Profilo
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={4} className="text-center mb-4">
                  <div className="mb-3">
                    <img
                      src={avatarPreview || user?.avatar}
                      alt="Avatar anteprima"
                      className="img-fluid rounded-circle"
                      style={{
                        width: "150px",
                        height: "150px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <Form.Group controlId="avatar">
                    <Form.Label>Cambia avatar</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={8}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="name">
                        <Form.Label>Nome</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="surname">
                        <Form.Label>Cognome</Form.Label>
                        <Form.Control
                          type="text"
                          name="surname"
                          value={formData.surname}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3" controlId="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="birth_date">
                    <Form.Label>Data di nascita</Form.Label>
                    <Form.Control
                      type="date"
                      name="birth_date"
                      value={formData.birth_date}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <div className="d-flex gap-2 mt-3">
                    <Button variant="primary" type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                          />
                          <span className="ms-2">Salvataggio...</span>
                        </>
                      ) : (
                        <>Salva modifiche</>
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditing(false);
                        setAvatarPreview(null);
                        setFormData({
                          name: user.name,
                          surname: user.surname,
                          email: user.email,
                          birth_date: user.birth_date
                            ? user.birth_date.split("T")[0]
                            : "",
                          avatar: null,
                        });
                      }}
                    >
                      Annulla
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Sezione per i post dell'utente */}
      <div className="mt-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>I miei post</h3>
          <Button as={Link} to="/new" variant="outline-primary">
            <i className="bi bi-plus-lg me-1"></i> Nuovo post
          </Button>
        </div>

        {userPosts.length > 0 ? (
          <Row>
            {userPosts.map((post) => (
              <Col md={4} key={post._id} className="mb-3">
                <Card>
                  <Card.Img
                    variant="top"
                    src={post.cover}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <Card.Body>
                    <Card.Title>{post.title}</Card.Title>
                    <Card.Text>{post.content.substring(0, 100)}...</Card.Text>
                    <Button
                      as={Link}
                      to={`/blog/${post._id}`}
                      variant="primary"
                      size="sm"
                    >
                      Leggi post
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Alert variant="info">
            Non hai ancora pubblicato nessun post. Crea il tuo primo post!
          </Alert>
        )}
      </div>
    </Container>
  );
};

export default Profile;
