import React, { useEffect, useState, useRef } from "react";
import {
  Container,
  Image,
  Row,
  Col,
  Card,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import BlogAuthor from "../../components/blog/blog-author/BlogAuthor";
import BlogLike from "../../components/likes/BlogLike";
import Comments from "../../components/comments/Comments";
import { useAuth } from "../../utils/AuthContext";
import axios from "axios";
import "./styles.css";

const BlogDetail = () => {
  const { id } = useParams();
  const { getToken } = useAuth();

  const [userData, setUserData] = useState(null);
  const [isAuth, setIsAuth] = useState(false);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });

  const checkAuth = async () => {
    const token = getToken();
    if (token) {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/authors/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserData(response.data);
        setIsAuth(true);
      } catch (error) {
        console.error("Errore nel recupero dei dati utente:", error);
        setIsAuth(false);
        setUserData(null);
      }
    } else {
      setIsAuth(false);
      setUserData(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLikesChange = async (newLikes) => {
    try {
      const token = getToken();
      if (!token) {
        setNotification({
          show: true,
          type: "warning",
          message: "Devi essere autenticato per mettere like ai post.",
        });
        return;
      }

      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/blogPost/${id}`,
        { ...post, likes: newLikes },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setPost((prev) => ({ ...prev, likes: newLikes }));
      }
    } catch (error) {
      console.error("Errore nell'aggiornamento dei like:", error);
      setNotification({
        show: true,
        type: "danger",
        message: "Errore nell'aggiornamento dei like.",
      });
    }
  };

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/blogPost/${id}`
      );
      setPost(response.data);
      setError(null);
    } catch (error) {
      console.error("Errore nel caricamento del post:", error);
      setError("Impossibile caricare il post. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handleCommentAdded = (updatedPost) => {
    setPost(updatedPost);
  };

  const handleCommentDeleted = (commentId) => {
    setPost((prev) => {
      return {
        ...prev,
        comments: prev.comments.filter((comment) => comment._id !== commentId),
      };
    });
  };

  const handleCommentUpdated = (updatedPost) => {
    setPost(updatedPost);
  };

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

  if (error || !post) {
    return (
      <Container className="mt-5 pt-5">
        <Alert variant="danger">{error || "Post non trovato"}</Alert>
      </Container>
    );
  }

  return (
    <Container className="blog-detail-container my-5 pt-4">
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

      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="border-0 shadow-sm mb-5">
            <Card.Body className="p-4">
              <h1 className="display-4 mb-3">{post.title}</h1>

              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                  <BlogAuthor {...post.author} />
                </div>

                <div className="d-flex flex-column align-items-end">
                  <Badge bg="secondary" className="mb-1">
                    {post.category}
                  </Badge>
                  <small className="text-muted">
                    {new Date(post.createdAt).toLocaleDateString("it-IT")}
                  </small>
                </div>
              </div>

              <div className="blog-image-container mb-4">
                <Image
                  className="blog-detail-cover"
                  src={post.cover}
                  fluid
                  alt={post.title}
                  style={{
                    borderRadius: "8px",
                    maxHeight: "500px",
                    width: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>

              <div className="blog-detail-content my-4">
                <p className="lead">{post.content}</p>
              </div>

              <div className="d-flex justify-content-between align-items-center border-top pt-3">
                <div className="blog-detail-likes">
                  <BlogLike postId={post._id} />
                </div>
                <div>
                  <small className="text-muted">
                    Tempo di lettura: {post.readTime?.value || 1} min
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Comments
            post={post}
            isAuth={isAuth}
            userData={userData}
            getToken={getToken}
            onCommentAdded={handleCommentAdded}
            onCommentDeleted={handleCommentDeleted}
            onCommentUpdated={handleCommentUpdated}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default BlogDetail;
