"use client"
import React from "react";
import { useParams, } from "next/navigation"; 

const MonitoringView = () => {
  const params = useParams<{ type: string }>();
  const dataType = params.type;
  return (
    // Main container background changed to white, text to gray-900
    <div className="p-4 bg-white min-h-screen text-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">{dataType?dataType:""}</h1>

    
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tr-lg">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200"> 
            <tr className="hover:bg-gray-100 transition-colors duration-200">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">Activity</td>  
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">150</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"> 
                <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">View</button>
              </td>
            </tr>
         
            <tr className="hover:bg-gray-100 transition-colors duration-200"> 
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">Courses</td> 
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">15</td> 
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"> 
                <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">View</button>
              </td>
            </tr>
           
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonitoringView;