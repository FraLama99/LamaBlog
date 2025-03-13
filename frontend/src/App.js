import React, { useState } from "react";
import NavBar from "./components/navbar/BlogNavbar";
import Footer from "./components/footer/Footer";
import Home from "./views/home/Home";
import Blog from "./views/blog/Blog";
import BlogDetail from "./views/blog/BlogDetail";
import NewBlogPost from "./views/new/New";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import Registrazione from "./views/new/Registrazione";
import Login from "./views/new/login";
import { AuthProvider } from "./utils/AuthContext.js";
function App() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <AuthProvider>
      <Router>
        <NavBar onSearch={handleSearch} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            exact
            element={<Home searchQuery={searchQuery} />}
          />
          <Route path="/register" element={<Registrazione />} />
          {/* <Route path="/blog/:id" element={<Blog />} /> */}
          <Route path="/blog/:id" element={<BlogDetail />} />

          <Route path="/new" element={<NewBlogPost />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
