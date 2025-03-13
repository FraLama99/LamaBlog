import React from "react";
import { Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import BlogAuthor from "../blog-author/BlogAuthor";
import "./styles.css";

const BlogItem = ({ post }) => {
  const { category, title, author, cover, content, readTime, _id } = post;
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/blog/${_id}`);
  };

  return (
    <Card
      className="blog-card"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      <Card.Img variant="top" src={cover} className="blog-cover" />
      <Card.Body>
        <Card.Title>{title}</Card.Title>
      </Card.Body>
      <Card.Footer>
        <BlogAuthor {...author} />
      </Card.Footer>
    </Card>
  );
};

export default BlogItem;
