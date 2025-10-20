"use client"
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";

interface Subject {
  subjectId: string;
  title: string;
  semester: string;
  year: number;
}

const UploadView = () => {
  const params = useParams<{ type: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dataType = params.type;
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('/api/student/subjects');
        if (response.ok) {
          const data = await response.json();
          setSubjects(data);
          
          // Set selected subject from URL params if exists
          const subjectId = searchParams.get('subjectId');
          if (subjectId && data.some((s: Subject) => s.subjectId === subjectId)) {
            setSelectedSubject(subjectId);
          } else if (data.length > 0) {
            setSelectedSubject(data[0].subjectId);
          }
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [searchParams]);

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subjectId = e.target.value;
    setSelectedSubject(subjectId);
    router.push(`/upload/${dataType}?subjectId=${subjectId}`);
  };

  if (loading) {
    return (
      <div className="p-4 bg-white min-h-screen text-gray-900 flex justify-center items-center">
        <div>Loading...</div>
      </div>
    );
  }

  const currentSubject = selectedSubject ? 
    subjects.find(s => s.subjectId === selectedSubject) : null;

  return (
    <div className="p-4 bg-white min-h-screen text-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        {dataType ? dataType.charAt(0).toUpperCase() + dataType.slice(1) : ""} Upload
      </h1>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Subject Selection */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            Select Subject
          </label>
          <select
            id="subject"
            value={selectedSubject || ''}
            onChange={handleSubjectChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {subjects.map((subject) => (
              <option key={subject.subjectId} value={subject.subjectId}>
                {subject.title} - {subject.semester} {subject.year}
              </option>
            ))}
          </select>
        </div>

        {currentSubject && (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              {currentSubject.title} - {currentSubject.semester} {currentSubject.year}
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Activity</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => {/* Handle upload */}}
                      >
                        Upload
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Assignment</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        In Review
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => {/* Handle upload */}}
                      >
                        Re-upload
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadView;