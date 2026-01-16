import React, { createContext, useState, useEffect } from "react";

export const PostsContext = createContext();

export function PostsProvider({ children }) {
  const [allPosts, setAllPosts] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load posts from localStorage on mount
  useEffect(() => {
    try {
      const savedPosts = localStorage.getItem("lostFoundPosts");
      if (savedPosts) {
        setAllPosts(JSON.parse(savedPosts));
      }
    } catch (error) {
      console.error("Error loading posts:", error);
    }
    setIsHydrated(true);
  }, []);

  // Save posts to localStorage whenever they change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("lostFoundPosts", JSON.stringify(allPosts));
    }
  }, [allPosts, isHydrated]);

  const addPost = (postData) => {
    const newPost = {
      id: Date.now(),
      ...postData,
      createdAt: new Date().toISOString(),
    };
    setAllPosts((prev) => [newPost, ...prev]);
    return newPost;
  };

  const deletePost = (postId) => {
    setAllPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  const getPosts = () => allPosts;

  return (
    <PostsContext.Provider value={{ allPosts, addPost, deletePost, getPosts, isHydrated }}>
      {children}
    </PostsContext.Provider>
  );
}
