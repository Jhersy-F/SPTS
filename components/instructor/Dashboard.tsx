"use client"
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

type Student = {
  id: number;
  firstName: string;
  lastName: string;
  studentNumber: string;
  sectionId: number | null;
  sectionName?: string;
  uploads: Array<{
    id: number;
    title: string;
    description: string;
    link: string;
  }>;
};

type SectionStats = {
  name: string;
  value: number;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function InstructorDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    studentsPerSection: SectionStats[];
    uploadsPerSection: SectionStats[];
  }>({ studentsPerSection: [], uploadsPerSection: [] });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      // Fetch students data
      const [studentsRes, statsRes] = await Promise.all([
        fetch('/api/instructor/students'),
        fetch('/api/instructor/dashboard/stats')
      ]);

      const studentsData = await studentsRes.json();
      const statsData = await statsRes.json();
      
      setStudents(studentsData.students || []);
      setStats({
        studentsPerSection: statsData.studentsPerSection || [],
        uploadsPerSection: statsData.uploadsPerSection || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg font-medium">Loading dashboard data...</div>
      </div>
    );
  }

  const totalStudents = students.length;
  const totalUploads = students.reduce((sum, s) => sum + (s.uploads?.length ?? 0), 0);
  const hasSectionData = stats.studentsPerSection.length > 0;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Instructor Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500">Total Students</h2>
          <p className="mt-2 text-4xl font-bold text-gray-900">{totalStudents}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500">Total Uploads</h2>
          <p className="mt-2 text-4xl font-bold text-gray-900">{totalUploads}</p>
        </div>
      </div>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Students per Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Students per Section</h2>
          {hasSectionData ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.studentsPerSection}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.studentsPerSection.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [
                      value as number, 
                      `${props.payload.name}: ${value} students`
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No section data available
            </div>
          )}
        </div>

        {/* Uploads per Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Uploads per Section</h2>
          {hasSectionData ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.uploadsPerSection}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    labelLine={false}
                    outerRadius={120}
                    fill="#82ca9d"
                    dataKey="value"
                  >
                    {stats.uploadsPerSection.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [
                      value as number, 
                      `${props.payload.name}: ${value} uploads`
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No section data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
