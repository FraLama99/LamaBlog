import React, { useState, useEffect } from "react";
import { Button, Container, Navbar, NavDropdown, Image } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";
import logo from "../../assets/logo.png";
import "./styles.css";

const NavBar = ({ onSearch }) => {
  const { isAuthenticated, logout, getToken } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  const fetchUserData = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.log("Token non presente");
        return;
      }

      const response = await fetch(
        process.env.REACT_APP_API_BASE_URL + "/authors/me",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Modifica questa riga: usa direttamente data invece di data.author
        setUserData(data);
      } else {
        console.error("Errore nella risposta:", response.status);
        setUserData(null);
      }
    } catch (error) {
      console.error("Errore nella chiamata:", error);
      setUserData(null);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
    } else {
      setUserData(null);
    }
  }, [isAuthenticated]); // Dipendenza solo da isAuthenticated

  const handleLogout = () => {
    setUserData(null); // Pulisci i dati utente
    logout();
    navigate("/login");
  };

  return (
    <Navbar expand="lg" className="blog-navbar" fixed="top">
      <Container className="justify-content-between">
        <Navbar.Brand as={Link} to="/">
          <img className="blog-navbar-brand" alt="logo" src={logo} />
        </Navbar.Brand>
        <Navbar.Text>
          <input
            type="text"
            placeholder="Search blogs..."
            className="form-control"
            onChange={(e) => onSearch(e.target.value)}
          />
        </Navbar.Text>

        {!isAuthenticated ? (
          <>
            <Button
              as={Link}
              to="/register"
              className="blog-navbar-add-button bg-dark"
              size="lg"
            >
              Registrazione
            </Button>
            <Button
              as={Link}
              to="/login"
              className="blog-navbar-add-button bg-dark"
              size="lg"
            >
              Login
            </Button>
          </>
        ) : (
          <NavDropdown
            drop="start"
            title={
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "#e0e0e0",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: "hidden",
                  }}
                >
                  {userData?.avatar && (
                    <Image
                      src={userData.avatar}
                      roundedCircle
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                </div>
                <span style={{ color: "#000" }}>
                  {userData?.name || "Profilo"}
                </span>
              </div>
            }
            id="nav-dropdown"
          >
            <NavDropdown.Item as={Link} to="/profile">
              {userData?.name || "Profilo"}
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/new">
              Crea Post
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/my-posts">
              I Miei Post
            </NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
          </NavDropdown>
        )}
      </Container>
    </Navbar>
  );
};

export default NavBar;
