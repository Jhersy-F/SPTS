"use client";

import React, { useState, useEffect } from "react";

interface UploadStat {
  type: string;
  count: number;
}

interface StatsResponse {
  stats: UploadStat[];
  total: number;
}

const Monitoring = () => {
  const [stats, setStats] = useState<UploadStat[]>([]);
  const [totalUploads, setTotalUploads] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/uploads/stats', {
          credentials: 'include',
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 401) {
            throw new Error('Please log in to view upload statistics');
          } else if (response.status === 403) {
            throw new Error('You do not have permission to view upload statistics');
          } else {
            throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch upload statistics`);
          }
        }
        
        const data: StatsResponse = await response.json();
        setStats(data.stats);
        setTotalUploads(data.total);
      } catch (err) {
        console.error('Fetch stats error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-white min-h-screen text-gray-900">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Monitoring</h1>
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white min-h-screen text-gray-900">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Monitoring</h1>
        <div className="text-center text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white min-h-screen text-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Monitoring</h1>

      {/* Summary Card */}
      <div className="mb-6 w-4/5 mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Upload Summary</h2>
          <p className="text-blue-700">Total Uploads: <span className="font-bold">{totalUploads}</span></p>
        </div>
      </div>
    
      <div className="overflow-x-auto bg-white rounded-lg shadow-md w-4/5 mx-auto">
        <table className="min-w-full divide-y divide-gray-200"> 
          <thead className="bg-gray-100"> 
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tl-lg"> 
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Total
              </th>
            
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200"> 
            {stats.map((stat) => (
              <tr key={stat.type} className="hover:bg-gray-100 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                  {stat.type}
                </td>  
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {stat.count}
                </td>
              
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Monitoring;