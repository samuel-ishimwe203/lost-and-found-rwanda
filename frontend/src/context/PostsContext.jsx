import React, { createContext, useState, useEffect } from "react";
import apiClient from '../services/api';

export const PostsContext = createContext();

export function PostsProvider({ children }) {
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/public/items?type=all&limit=200');
      // Backend returns lostItems and foundItems arrays
      const lostItems = response.data.data?.lostItems || [];
      const foundItems = response.data.data?.foundItems || [];
      const items = [...lostItems, ...foundItems];
      console.log(`📍 Fetched ${lostItems.length} lost + ${foundItems.length} found = ${items.length} total posts`);
      setAllPosts(items);
    } catch (error) {
      console.error('Error loading posts:', error);
      setAllPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    
  }, []);

  const addPost = async (postData) => {
    try {
      const isLostItem = postData.location_lost || postData.date_lost;
      const endpoint = isLostItem ? '/lost-items' : '/found-items';
      
      const response = await apiClient.post(endpoint, postData);
      const newPost = response.data.data.lostItem || response.data.data.foundItem;
      
      setAllPosts((prev) => [newPost, ...prev]);
      await fetchPosts();
      return newPost;
    } catch (error) {
      console.error('Error adding post:', error);
      throw error;
    }
  };

  const deletePost = async (postId, itemType) => {
    try {
      const endpoint = itemType === 'lost' ? `/lost-items/${postId}` : `/found-items/${postId}`;
      await apiClient.delete(endpoint);
      setAllPosts((prev) => prev.filter((post) => post.id !== postId));
      await fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  };

  const refreshPosts = async () => {
    await fetchPosts();
  };

  const getPosts = () => allPosts;

  return (
    <PostsContext.Provider value={{ 
      allPosts, 
      addPost, 
      deletePost, 
      getPosts, 
      refreshPosts,
      loading 
    }}>
      {children}
    </PostsContext.Provider>
  );
}
