import React from "react";
import { Container } from "react-bootstrap";

const Footer = (props) => {
  return (
    <footer
      style={{
        paddingTop: 50,
        paddingBottom: 50,
      }}
    >
      <Container>
        {`${new Date().getFullYear()} - © BTG System | This is a demo page created for a developer course examination. For educational and display purposes only.`}
      </Container>
    </footer>
  );
};

export default Footer;
