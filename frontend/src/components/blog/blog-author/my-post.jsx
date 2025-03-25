import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
  Modal,
  Form,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../utils/AuthContext";

const MyPosts = () => {
  const { isAuthenticated, getToken } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });

  // Form data per la modifica del post
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    content: "",
    readTime: {
      value: 1,
      unit: "minutes",
    },
  });

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

      // Recupera i post dell'utente
      fetchUserPosts(response.data._id, token);
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
      setLoading(false);
    } catch (err) {
      console.error("Errore nel recupero dei post:", err);
      setLoading(false);
    }
  };

  // Mostra il modal di conferma per l'eliminazione
  const confirmDelete = (post) => {
    setPostToDelete(post);
    setShowDeleteModal(true);
  };

  // Elimina il post
  const deletePost = async () => {
    try {
      const token = getToken();

      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/blogPost/${postToDelete._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Aggiorna la lista dei post dopo l'eliminazione
      setUserPosts(userPosts.filter((post) => post._id !== postToDelete._id));

      setShowDeleteModal(false);
      setPostToDelete(null);

      setNotification({
        show: true,
        type: "success",
        message: "Post eliminato con successo!",
      });

      setTimeout(() => {
        setNotification({ show: false, type: "", message: "" });
      }, 3000);
    } catch (err) {
      console.error("Errore durante l'eliminazione:", err);
      setNotification({
        show: true,
        type: "danger",
        message: `Errore durante l'eliminazione: ${
          err.response?.data?.message || err.message
        }`,
      });
    }
  };

  // Apre il modal di modifica e imposta i dati del post
  const openEditModal = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      category: post.category,
      content: post.content,
      readTime: post.readTime || { value: 1, unit: "minutes" },
    });
    setShowEditModal(true);
  };

  // Gestisce i cambiamenti nei campi del form
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "readTimeValue") {
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

  // Aggiorna il post
  const updatePost = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();

      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/blogPost/${editingPost._id}`,
        {
          title: formData.title,
          category: formData.category,
          content: formData.content,
          readTime: formData.readTime,
          author: user._id,
          cover: editingPost.cover,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Aggiorna la lista dei post con il post modificato
      setUserPosts(
        userPosts.map((post) =>
          post._id === editingPost._id ? response.data : post
        )
      );

      setShowEditModal(false);

      setNotification({
        show: true,
        type: "success",
        message: "Post aggiornato con successo!",
      });

      setTimeout(() => {
        setNotification({ show: false, type: "", message: "" });
      }, 3000);
    } catch (err) {
      console.error("Errore durante l'aggiornamento:", err);
      setNotification({
        show: true,
        type: "danger",
        message: `Errore durante l'aggiornamento: ${
          err.response?.data?.message || err.message
        }`,
      });
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
    } else {
      setError("Effettua il login per visualizzare i tuoi post");
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (loading) {
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>I Miei Post</h1>
        <Button as={Link} to="/new" variant="success">
          <i className="bi bi-plus-lg me-1"></i> Nuovo Post
        </Button>
      </div>

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

      {userPosts.length > 0 ? (
        <Row>
          {userPosts.map((post) => (
            <Col lg={4} md={6} key={post._id} className="mb-4">
              <Card
                className="h-100 shadow-sm"
                style={{
                  transition: "transform 0.2s",
                  border: "1px solid rgba(0,0,0,.125)",
                }}
              >
                <Card.Img
                  variant="top"
                  src={post.cover}
                  style={{ height: "180px", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/300x180?text=Immagine+non+disponibile";
                  }}
                />
                <Card.Body>
                  <Card.Title>{post.title}</Card.Title>
                  <Card.Text>
                    {post.content.substring(0, 100)}
                    {post.content.length > 100 ? "..." : ""}
                  </Card.Text>
                  <div className="d-flex justify-content-between mt-2">
                    <small className="text-muted">
                      <i className="bi bi-calendar3"></i>{" "}
                      {new Date(post.createdAt).toLocaleDateString("it-IT")}
                    </small>
                    <small className="text-muted">
                      <i className="bi bi-clock"></i>{" "}
                      {post.readTime?.value || 1} min lettura
                    </small>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-white">
                  <div className="d-flex justify-content-between">
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => openEditModal(post)}
                      className="w-100 me-1"
                    >
                      <i className="bi bi-pencil-square me-1"></i> Modifica
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => confirmDelete(post)}
                      className="w-100 ms-1"
                    >
                      <i className="bi bi-trash me-1"></i> Elimina
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Alert variant="info">
          Non hai ancora pubblicato nessun post. Crea il tuo primo post!
        </Alert>
      )}

      {/* Modal per conferma eliminazione */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Conferma eliminazione</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Sei sicuro di voler eliminare il post "{postToDelete?.title}"? Questa
          azione non può essere annullata.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annulla
          </Button>
          <Button variant="danger" onClick={deletePost}>
            Elimina
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal per modifica post */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Modifica Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={updatePost}>
            <Form.Group className="mb-3">
              <Form.Label>Titolo</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Categoria</Form.Label>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option>Tech</option>
                <option>Social</option>
                <option>NEWS</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tempo di lettura (minuti)</Form.Label>
              <Form.Control
                type="number"
                name="readTimeValue"
                min="1"
                value={formData.readTime?.value || 1}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contenuto</Form.Label>
              <Form.Control
                as="textarea"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={8}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Annulla
          </Button>
          <Button variant="warning" onClick={updatePost}>
            Salva modifiche
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyPosts;
