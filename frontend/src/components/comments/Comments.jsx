import React, { useState, useRef } from "react";
import {
  Form,
  Button,
  Card,
  Alert,
  Image,
  Modal,
  Spinner,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";

const Comments = ({
  post,
  isAuth,
  userData,
  getToken,
  onCommentAdded,
  onCommentDeleted,
  onCommentUpdated,
}) => {
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const commentSectionRef = useRef(null);

  // Aggiunge un commento
  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    const token = getToken();
    if (!token) {
      setNotification({
        show: true,
        type: "danger",
        message: "Devi essere autenticato per commentare. Effettua il login.",
      });
      return;
    }

    try {
      setLoading(true);
      if (!userData || !userData._id) {
        setNotification({
          show: true,
          type: "danger",
          message: "Impossibile identificare l'utente. Riprova.",
        });
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/blogPost/${post._id}/comments`,
        {
          text: newComment,
          user: userData._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Chiamiamo la callback per notificare il componente padre
      onCommentAdded(response.data);

      setNewComment("");
      setNotification({
        show: true,
        type: "success",
        message: "Commento aggiunto con successo!",
      });

      // Scroll ai commenti
      setTimeout(() => {
        if (commentSectionRef.current) {
          commentSectionRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);

      setTimeout(() => {
        setNotification({ show: false, type: "", message: "" });
      }, 3000);
    } catch (error) {
      console.error("Errore nell'aggiunta del commento:", error);

      let errorMessage = "Errore nell'aggiunta del commento.";
      if (error.response) {
        errorMessage += ` ${
          error.response.data?.message || error.response.statusText
        }`;
      }

      setNotification({
        show: true,
        type: "danger",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Avvia la modifica di un commento
  const startEditComment = (comment) => {
    setEditingComment(comment._id);
    setEditedCommentText(comment.text);
  };

  // Salva le modifiche al commento
  const handleEditComment = async () => {
    if (!editedCommentText.trim()) return;

    const token = getToken();
    if (!token) {
      setNotification({
        show: true,
        type: "danger",
        message: "Devi essere autenticato per modificare il commento.",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/blogPost/${post._id}/comments/${editingComment}`,
        {
          content: editedCommentText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Notifica il componente padre
      onCommentUpdated(response.data);

      setEditingComment(null);
      setEditedCommentText("");
      setNotification({
        show: true,
        type: "success",
        message: "Commento modificato con successo!",
      });

      setTimeout(() => {
        setNotification({ show: false, type: "", message: "" });
      }, 3000);
    } catch (error) {
      console.error("Errore nella modifica del commento:", error);
      setNotification({
        show: true,
        type: "danger",
        message: "Errore nella modifica del commento.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Conferma eliminazione commento
  const confirmDeleteComment = (commentId) => {
    setCommentToDelete(commentId);
    setShowDeleteModal(true);
  };

  // Elimina il commento
  const handleDeleteComment = async () => {
    const token = getToken();
    if (!token) {
      setNotification({
        show: true,
        type: "danger",
        message: "Devi essere autenticato per eliminare il commento.",
      });
      return;
    }

    try {
      setLoading(true);
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/blogPost/${post._id}/comments/${commentToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Notifica il componente padre
      onCommentDeleted(commentToDelete);

      setShowDeleteModal(false);
      setCommentToDelete(null);

      setNotification({
        show: true,
        type: "success",
        message: "Commento eliminato con successo!",
      });

      setTimeout(() => {
        setNotification({ show: false, type: "", message: "" });
      }, 3000);
    } catch (error) {
      console.error("Errore nell'eliminazione del commento:", error);
      setNotification({
        show: true,
        type: "danger",
        message: "Errore nell'eliminazione del commento.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Verifica se l'utente può modificare o eliminare un commento
  const canEditComment = (comment) => {
    return (
      isAuth && userData && comment.user && userData._id === comment.user._id
    );
  };

  const canDeleteComment = (comment) => {
    return (
      isAuth &&
      userData &&
      ((comment.user && userData._id === comment.user._id) ||
        (post.author && userData._id === post.author._id))
    );
  };

  return (
    <>
      {notification.show && (
        <Alert
          variant={notification.type}
          onClose={() =>
            setNotification({ show: false, type: "", message: "" })
          }
          dismissible
          className="mb-4"
        >
          {notification.message}
        </Alert>
      )}

      <Card className="border-0 shadow-sm" ref={commentSectionRef}>
        <Card.Header className="bg-white">
          <h3 className="mb-0">Commenti ({post.comments?.length || 0})</h3>
        </Card.Header>

        <Card.Body className="p-4">
          {/* Form per aggiungere commento */}
          {isAuth && userData ? (
            <Form onSubmit={handleAddComment} className="mb-4">
              <Form.Group className="mb-3">
                <Form.Label>Aggiungi un commento</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Scrivi il tuo commento qui..."
                  required
                  disabled={loading}
                />
              </Form.Group>
              <div className="text-end">
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Invio...
                    </>
                  ) : (
                    "Invia commento"
                  )}
                </Button>
              </div>
            </Form>
          ) : (
            <Alert variant="info" className="mb-4">
              <Link to="/login">Accedi</Link> per lasciare un commento.
            </Alert>
          )}

          {/* Lista dei commenti */}
          {post.comments?.length > 0 ? (
            <div className="comment-list">
              {post.comments.map((comment) => (
                <Card key={comment._id} className="mb-3 border-0 bg-light">
                  <Card.Body>
                    {editingComment === comment._id ? (
                      <Form>
                        <Form.Group className="mb-3">
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={editedCommentText}
                            onChange={(e) =>
                              setEditedCommentText(e.target.value)
                            }
                            required
                            disabled={loading}
                          />
                        </Form.Group>
                        <div className="d-flex justify-content-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setEditingComment(null)}
                            disabled={loading}
                          >
                            Annulla
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleEditComment}
                            disabled={loading}
                          >
                            {loading ? "Salvando..." : "Salva"}
                          </Button>
                        </div>
                      </Form>
                    ) : (
                      <>
                        <div className="d-flex justify-content-between mb-2">
                          <div className="d-flex align-items-center">
                            <Image
                              src={comment.user?.avatar}
                              roundedCircle
                              className="me-2"
                              style={{ width: "40px", height: "40px" }}
                            />

                            <div>
                              <strong className="d-block">
                                {comment.user?.name || "Utente"}{" "}
                                {comment.user?.surname || ""}
                              </strong>
                              <small className="text-muted">
                                {new Date(comment.date).toLocaleDateString(
                                  "it-IT",
                                  {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </small>
                            </div>
                          </div>

                          {/* Pulsanti di modifica/eliminazione */}
                          <div className="d-flex gap-2">
                            {canEditComment(comment) && (
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => startEditComment(comment)}
                              >
                                <i className="bi bi-pencil-square me-1"></i>{" "}
                                Modifica
                              </Button>
                            )}
                            {canDeleteComment(comment) && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() =>
                                  confirmDeleteComment(comment._id)
                                }
                              >
                                <i className="bi bi-trash me-1"></i> Elimina
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="mb-0">{comment.text}</p>
                      </>
                    )}
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center my-4">
              <p className="text-muted">Non ci sono ancora commenti.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal di conferma eliminazione commento */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Conferma eliminazione</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Sei sicuro di voler eliminare questo commento? Questa azione non può
          essere annullata.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annulla
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteComment}
            disabled={loading}
          >
            {loading ? "Eliminando..." : "Elimina"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Comments;
