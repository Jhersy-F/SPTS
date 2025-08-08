"use client"
import React, { useEffect, useState } from "react";
import UploadForm from "@/components/uploads/UploadForm";

type UploadItem = {
  id: number;
  title: string;
  description: string;
  link: string;
};

const Upload = () => {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; description: string }>({ title: "", description: "" });

  const loadUploads = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/uploads", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load uploads");
      setUploads(data.uploads || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load uploads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUploads();
  }, []);

  const onDelete = async (id: number) => {
    if (!confirm("Delete this document?")) return;
    const res = await fetch(`/api/uploads/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data?.error || "Delete failed");
      return;
    }
    setUploads((prev) => prev.filter((u) => u.id !== id));
  };

  const startEdit = (u: UploadItem) => {
    setEditingId(u.id);
    setEditForm({ title: u.title, description: u.description });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: number) => {
    const res = await fetch(`/api/uploads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data?.error || "Update failed");
      return;
    }
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...data.upload } : u)));
    setEditingId(null);
  };

  return (
    <div className="p-4 bg-white min-h-screen text-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Upload Documents</h1>

      <div className="max-w-3xl mx-auto mb-10">
        <UploadForm />
        <div className="mt-4 text-right">
          <button onClick={loadUploads} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Refresh List</button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md max-w-5xl mx-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">File</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading && (
              <tr><td colSpan={4} className="px-6 py-4 text-sm text-gray-700">Loading...</td></tr>
            )}
            {!!error && (
              <tr><td colSpan={4} className="px-6 py-4 text-sm text-red-600">{error}</td></tr>
            )}
            {uploads.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                  {editingId === u.id ? (
                    <input className="border px-2 py-1 rounded w-full" value={editForm.title} onChange={(e)=>setEditForm((f)=>({...f, title: e.target.value}))} />
                  ) : (
                    u.title
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {editingId === u.id ? (
                    <input className="border px-2 py-1 rounded w-full" value={editForm.description} onChange={(e)=>setEditForm((f)=>({...f, description: e.target.value}))} />
                  ) : (
                    u.description
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                  <a href={u.link} target="_blank" rel="noreferrer" className="underline">View</a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 space-x-2">
                  {editingId === u.id ? (
                    <>
                      <button onClick={()=>saveEdit(u.id)} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Save</button>
                      <button onClick={cancelEdit} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={()=>startEdit(u)} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Edit</button>
                      <button onClick={()=>onDelete(u.id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {!loading && uploads.length === 0 && !error && (
              <tr><td colSpan={4} className="px-6 py-4 text-sm text-gray-500">No uploads yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Upload;