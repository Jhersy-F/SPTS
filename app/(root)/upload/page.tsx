"use client"
import React, { useEffect, useState } from "react";
import UploadForm from "@/components/uploads/UploadForm";

type UploadItem = {
  id: number;
  title: string;
  description: string;
  type: string;
  link: string;
  instructor?: string;
  subject?: string;
};

const Upload = () => {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [filteredUploads, setFilteredUploads] = useState<UploadItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; description: string; instructor: string; subject: string }>({ title: "", description: "", instructor: "", subject: "" });
  const [showForm, setShowForm] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [instructors, setInstructors] = useState<Array<{id:number; firstName:string; lastName:string; username:string}>>([]);
  const [loadingInstructors, setLoadingInstructors] = useState<boolean>(false);

  const loadUploads = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/uploads", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load uploads");
      setUploads(data.uploads || []);
      setFilteredUploads(data.uploads || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load uploads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUploads();
  }, []);

  // Load instructors for edit dropdowns
  useEffect(() => {
    const loadInstructors = async () => {
      try {
        setLoadingInstructors(true);
        const res = await fetch('/api/instructors');
        const data = await res.json();
        if (res.ok) setInstructors(data.instructors || []);
      } finally {
        setLoadingInstructors(false);
      }
    };
    loadInstructors();
  }, []);

  const onDelete = async (id: number) => {
    if (!confirm("Delete this document?")) return;
    const res = await fetch(`/api/uploads/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data?.error || "Delete failed");
      return;
    }
    const updatedUploads = uploads.filter((u) => u.id !== id);
    setUploads(updatedUploads);
    applyTypeFilter(updatedUploads, typeFilter);
  };

  const startEdit = (u: UploadItem) => {
    setEditingId(u.id);
    setEditForm({ title: u.title, description: u.description, instructor: u.instructor || "", subject: u.subject || "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: number) => {
    const res = await fetch(`/api/uploads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editForm.title,
        description: editForm.description,
        instructor: editForm.instructor,
        subject: editForm.subject,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data?.error || "Update failed");
      return;
    }
    const updatedUploads = uploads.map((u) => (u.id === id ? { ...u, ...data.upload } : u));
    setUploads(updatedUploads);
    applyTypeFilter(updatedUploads, typeFilter);
    setEditingId(null);
  };

  const applyTypeFilter = (uploadsList: UploadItem[], filter: string) => {
    if (filter === "all") {
      setFilteredUploads(uploadsList);
    } else {
      setFilteredUploads(uploadsList.filter(upload => upload.type === filter));
    }
  };

  const handleTypeFilterChange = (filter: string) => {
    setTypeFilter(filter);
    applyTypeFilter(uploads, filter);
  };

  const getUniqueTypes = () => {
    const types = uploads.map(upload => upload.type).filter(Boolean);
    return [...new Set(types)];
  };

  return (
    <div className="p-4 bg-white min-h-screen text-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Upload Documents</h1>

      <div className="max-w-3xl mx-auto mb-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Upload
            </button>
            <div className="flex items-center space-x-2">
              <label htmlFor="typeFilter" className="text-sm font-medium text-gray-700">
                Filter by Type:
              </label>
              <select
                id="typeFilter"
                value={typeFilter}
                onChange={(e) => handleTypeFilterChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="quiz">Quiz</option>
                <option value="activity">Activity</option>
                <option value="exam">Exam</option>
              </select>
            </div>
          </div>
          <button onClick={loadUploads} className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300">Refresh List</button>
        </div>

        {showForm && (
          <div className="mt-6">
            <UploadForm
              onSuccess={() => {
                setShowForm(false);
                loadUploads();
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md max-w-5xl mx-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Instructor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">File</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading && (
              <tr><td colSpan={7} className="px-6 py-4 text-sm text-gray-700">Loading...</td></tr>
            )}
            {!!error && (
              <tr><td colSpan={7} className="px-6 py-4 text-sm text-red-600">{error}</td></tr>
            )}
            {filteredUploads.map((u) => (
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {editingId === u.id ? (
                    <select
                      className="border px-2 py-1 rounded w-full"
                      value={editForm.instructor}
                      onChange={(e)=>setEditForm((f)=>({...f, instructor: e.target.value}))}
                      disabled={loadingInstructors}
                    >
                      <option value="">Select an instructor</option>
                      {instructors.map((i)=> (
                        <option key={i.id} value={`${i.firstName} ${i.lastName}`}>
                          {i.firstName} {i.lastName} ({i.username})
                        </option>
                      ))}
                    </select>
                  ) : (
                    u.instructor || '-'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {editingId === u.id ? (
                    <select
                      className="border px-2 py-1 rounded w-full"
                      value={editForm.subject}
                      onChange={(e)=>setEditForm((f)=>({...f, subject: e.target.value}))}
                    >
                      <option value="">Select a subject</option>
                      <option value="subject1">Subject 1</option>
                      <option value="subject2">Subject 2</option>
                    </select>
                  ) : (
                    u.subject || '-'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {u.type || 'Unknown'}
                  </span>
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
            {!loading && filteredUploads.length === 0 && uploads.length > 0 && !error && (
              <tr><td colSpan={7} className="px-6 py-4 text-sm text-gray-500">No uploads match the selected filter.</td></tr>
            )}
            {!loading && uploads.length === 0 && !error && (
              <tr><td colSpan={7} className="px-6 py-4 text-sm text-gray-500">No uploads yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Upload;