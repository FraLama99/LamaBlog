import React, { useEffect, useState } from "react";
import { Container, Image, Row, Col } from "react-bootstrap";
import { useParams } from "react-router-dom";
import BlogAuthor from "../../components/blog/blog-author/BlogAuthor";
import BlogLike from "../../components/likes/BlogLike";
import "./styles.css";

const BlogDetail = () => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  const handleLikesChange = async (newLikes) => {
    try {
      const response = await fetch(`REACT_APP_API_BASE_URL/blogPosts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...post, likes: newLikes }),
      });
      if (response.ok) {
        setPost((prev) => ({ ...prev, likes: newLikes }));
      }
    } catch (error) {
      console.error("Errore nell'aggiornamento dei like:", error);
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(
          process.env.REACT_APP_API_BASE_URL + `/blogPost/${id}`
        );
        if (response.ok) {
          const data = await response.json();
          setPost(data);
        }
      } catch (error) {
        console.error("Errore nel caricamento del post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return <div>Caricamento in corso...</div>;
  }

  if (!post) {
    return <div>Post non trovato</div>;
  }

  return (
    <Container className="blog-detail-container pt-3">
      <Row className="justify-content-center">
        <Col md={8}>
          <h1 className="blog-detail-title">{post.title}</h1>
          <div className="blog-detail-metadata">
            <BlogAuthor {...post.author} />
            <p>cazzo</p>
            <span className="blog-detail-date">
              {new Date(post.createdAt).toLocaleDateString("it-IT")}
            </span>
          </div>
          <Image
            className="blog-detail-cover"
            src={post.cover}
            fluid
            alt={post.title}
          />
          <div className="blog-detail-content">
            <p>{post.content}</p>
          </div>
          <div className="blog-detail-interactions">
            <div className="blog-detail-likes">
              <BlogLike
                defaultLikes={post.likes || []}
                onChange={handleLikesChange}
              />
            </div>
            <div className="blog-detail-comments">
              <h3>Commenti ({post.comments?.length || 0})</h3>
              {post.comments?.map((comment, index) => (
                <div key={index} className="blog-comment">
                  <div className="comment-header">
                    <strong>
                      {comment.user.name} {comment.user.surname}
                    </strong>
                    <span className="comment-date">
                      {new Date(comment.date).toLocaleDateString("it-IT")}
                    </span>
                  </div>
                  <p>{comment.text}</p>
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default BlogDetail;
