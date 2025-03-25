import React from "react";
import { Col, Image, Row } from "react-bootstrap";
import "./styles.css";

const BlogAuthor = (props) => {
  const { name, surname, avatar } = props;
  return (
    <Row className="justify-content-center align-items-center">
      <Col xs={"auto"} className="pe-0">
        <Image className="blog-author" src={avatar} roundedCircle />
      </Col>
      <Col>
        <h5>{name}</h5>
        <h5>{surname}</h5>
      </Col>
    </Row>
  );
};

export default BlogAuthor;
