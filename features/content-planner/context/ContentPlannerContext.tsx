"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import type { ContentPost } from "@/features/content-planner";
import { createContentPost, deleteContentPost, listContentPosts, updateContentPost as saveContentPost } from "@/features/content-planner/services/content.client";

interface ContentPlannerContextType {
  posts: ContentPost[];
  addPost: (post: Partial<ContentPost>) => void;
  updatePost: (id: string, updates: Partial<ContentPost>) => void;
  deletePosts: (ids: string[]) => void;
}

const ContentPlannerContext = createContext<ContentPlannerContextType | undefined>(undefined);

export function ContentPlannerProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<ContentPost[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const items = await listContentPosts<ContentPost>();
        if (!cancelled) setPosts(items);
      } catch (err) {
        console.error("Failed to load content posts:", err);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const addPost = useCallback((partial: Partial<ContentPost>) => {
    const newPost: ContentPost = {
      id: "cp" + Date.now(),
      title: partial.title || "New Entry",
      date: partial.date || new Date().toISOString(),
      time: partial.time || "12:00 PM",
      status: partial.status || "Planned",
      targetAccountId: partial.targetAccountId || "",
      type: partial.type || "Post",
      tags: partial.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...partial
    };
    
    // Optimistic update
    setPosts(prev => [newPost, ...prev]);

    createContentPost<ContentPost>(newPost)
      .then((created) => {
        setPosts(prev => prev.map(p => p.id === newPost.id ? created : p));
      })
      .catch((err) => {
        console.error("Failed to create content post:", err);
        setPosts(prev => prev.filter(p => p.id !== newPost.id)); // Revert
      });
  }, []);

  const updatePost = useCallback((id: string, updates: Partial<ContentPost>) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const updated = { ...p, ...updates, updatedAt: new Date().toISOString() };
      saveContentPost<ContentPost>(id, updated).catch((err) => {
        console.error("Failed to update content post:", err);
      });
      return updated;
    }));
  }, []);

  const deletePosts = useCallback((ids: string[]) => {
    setPosts(prev => prev.filter(p => !ids.includes(p.id)));
    Promise.all(
      ids.map((id) => {
        if (id.startsWith("cp")) return Promise.resolve();
        return deleteContentPost(id).catch((err) => {
          console.error("Failed to delete content post:", err);
        });
      })
    ).catch(() => undefined);
  }, []);

  const value = useMemo(() => ({
    posts,
    addPost,
    updatePost,
    deletePosts
  }), [posts, addPost, updatePost, deletePosts]);

  return <ContentPlannerContext.Provider value={value}>{children}</ContentPlannerContext.Provider>;
}

export function useContentPlanner() {
  const context = useContext(ContentPlannerContext);
  if (context === undefined) {
    throw new Error("useContentPlanner must be used within a ContentPlannerProvider");
  }
  return context;
}
