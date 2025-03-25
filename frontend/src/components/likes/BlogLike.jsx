import React, { useState, useEffect, useCallback } from "react";
import { AiOutlineLike, AiFillLike } from "react-icons/ai";
import { Button } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../../utils/AuthContext";

export default function BlogLike({ postId }) {
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, getToken } = useAuth();

  const checkLikeStatus = useCallback(async () => {
    try {
      if (!isAuthenticated) return;

      const token = getToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/posts/${postId}/likes/check`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsLiked(response.data.liked);
    } catch (error) {
      console.error("Errore nel controllo del like:", error);
    }
  }, [isAuthenticated, getToken, postId]);

  const fetchLikeCount = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/posts/${postId}/likes`
      );
      setLikeCount(response.data.count);
    } catch (error) {
      console.error("Errore nel recupero dei like:", error);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (postId) {
      fetchLikeCount();
      checkLikeStatus();
    }
  }, [postId, isAuthenticated, fetchLikeCount, checkLikeStatus]);

  const toggleLike = async () => {
    if (!isAuthenticated) {
      alert("Devi effettuare l'accesso per mettere like");
      return;
    }

    try {
      setLoading(true);
      const token = getToken();

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/posts/${postId}/likes/toggle`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsLiked(response.data.status === "liked");
      setLikeCount(response.data.likeCount);
    } catch (error) {
      console.error("Errore nel toggle del like:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        onClick={toggleLike}
        variant={isLiked ? "dark" : "outline-dark"}
        disabled={loading || !isAuthenticated}
        className="d-flex align-items-center gap-1"
      >
        {isLiked ? <AiFillLike /> : <AiOutlineLike />}
        <span>
          {likeCount} {likeCount === 1 ? "like" : "likes"}
        </span>
      </Button>
    </div>
  );
}
