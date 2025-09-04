'use client';

import { useState } from 'react';

export default function DebugDashboard() {
  const [count, setCount] = useState(0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 data-testid="debug-title" className="text-3xl font-bold mb-4">
        Debug Dashboard
      </h1>
      <p className="mb-4">This is a simple debug page to test basic functionality.</p>
      
      <div className="space-y-4">
        <div>
          <button 
            onClick={() => setCount(c => c + 1)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Count: {count}
          </button>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Environment Check:</h2>
          <p>NODE_ENV: {process.env.NODE_ENV}</p>
          <p>Next.js Version: Working</p>
          <p>Tailwind CSS: {count > 0 ? 'Working' : 'Click button to test'}</p>
        </div>
        
        <div className="bg-blue-100 p-4 rounded">
          <h2 data-testid="week-navigation" className="font-bold mb-2">Mock Week Navigation</h2>
          <div className="flex gap-2">
            <button className="bg-gray-200 px-3 py-1 rounded">&larr; Previous</button>
            <span className="px-3 py-1">This Week</span>
            <button className="bg-gray-200 px-3 py-1 rounded">Next &rarr;</button>
          </div>
        </div>
        
        <div className="bg-green-100 p-4 rounded">
          <h2 data-testid="week-view" className="font-bold mb-2">Mock Week View</h2>
          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="bg-white p-2 rounded text-center">
                <div className="font-semibold">{day}</div>
                <div className="text-sm text-gray-500">No tasks</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}