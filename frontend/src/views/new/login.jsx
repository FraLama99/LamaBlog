import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";

const Login = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value,
    });
  };
  const handleGoogleLogin = () => {
    sessionStorage.setItem("redirectAfterLogin", "true");
    localStorage.setItem("pendingGoogleAuth", "true");
    window.location.href = `${process.env.REACT_APP_API_BASE_URL}/authors/login-google`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        process.env.REACT_APP_API_BASE_URL + "/authors/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        await login(data.token);
        navigate("/", { replace: true });
      } else {
        setError(data.message || "Login fallito");
      }
    } catch (error) {
      console.error("Errore durante il login:", error);
      setError("Si è verificato un errore durante il login");
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <h2 className="text-center mb-4">Login</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleInputChange}
                required
                autoComplete="username"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleInputChange}
                required
                autoComplete="current-password"
              />
            </Form.Group>

            <Button variant="dark" type="submit" className="w-100">
              Login
            </Button>
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
              Accedi con Google
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
