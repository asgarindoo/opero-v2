export async function listContentPosts<T>() {
  const res = await fetch("/api/tenant/content-planner");
  if (!res.ok) throw new Error("Failed to fetch content posts");
  return res.json() as Promise<T[]>;
}

export async function createContentPost<T>(data: T) {
  const res = await fetch("/api/tenant/content-planner", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to create content post");
  return res.json() as Promise<T>;
}

export async function updateContentPost<T>(id: string, data: Partial<T>) {
  const res = await fetch(`/api/tenant/content-planner/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to update content post");
  return res.json() as Promise<T>;
}

export async function deleteContentPost(id: string) {
  const res = await fetch(`/api/tenant/content-planner/${id}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to delete content post");
  return res.json() as Promise<{ success: boolean }>;
}
