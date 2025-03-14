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
import Profile from "./components/blog/blog-author/profile.jsx";
import MyPosts from "./components/blog/blog-author/my-post.jsx";
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

          <Route path="/blog/:id" element={<BlogDetail />} />

          <Route path="/new" element={<NewBlogPost />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-posts" element={<MyPosts />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
