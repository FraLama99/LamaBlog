import React, { useState, useEffect } from "react";
import { Col, Row, Button, Container } from "react-bootstrap";
import BlogItem from "../blog-item/BlogItem";
import { useAuth } from "../../../utils/AuthContext";

const BlogList = ({ searchQuery, page = 1, perPage = 9 }) => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(page);
  const [totalPages, setTotalPages] = useState(1);
  const { getToken } = useAuth();

  const fetchBlogPosts = async () => {
    try {
      const token = getToken();

      if (!token) {
        console.error("Token non trovato");
        return;
      }

      const response = await fetch(
        process.env.REACT_APP_API_BASE_URL +
          `/blogPost?page=${currentPage}&perPage=${perPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPosts(data.data);
        setFilteredPosts(data.data);
        setTotalPages(data.totalPages);
      } else {
        console.error("Server response not ok:", response.status);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Effetto per il caricamento iniziale dei post
  useEffect(() => {
    fetchBlogPosts();
  }, [currentPage, perPage]);

  // Effetto per il filtraggio dei post
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter((post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPosts(filtered);
    }
  }, [searchQuery, posts]);

  return (
    <Container>
      {/* Paginazione superiore */}
      <Row className="mb-4 justify-content-center">
        <Col xs="auto">
          <Button
            variant="outline-warning"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Precedente
          </Button>
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
          Pagina {currentPage} di {totalPages}
        </Col>
        <Col xs="auto">
          <Button
            variant="outline-warning"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Successiva
          </Button>
        </Col>
      </Row>

      {/* Lista dei post */}
      <Row>
        {filteredPosts.map((post, i) => (
          <Col
            key={post._id || i}
            md={4}
            style={{
              marginBottom: 50,
            }}
          >
            <BlogItem post={post} />
          </Col>
        ))}
      </Row>

      {/* Paginazione inferiore */}
      <Row className="mt-4 justify-content-center">
        <Col xs="auto">
          <Button
            variant="outline-warning"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Precedente
          </Button>
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
          Pagina {currentPage} di {totalPages}
        </Col>
        <Col xs="auto">
          <Button
            variant="outline-warning"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Successiva
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default BlogList;
