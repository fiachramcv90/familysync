export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Family Dashboard</h1>
        <p className="text-gray-600">Your family&apos;s coordination hub</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Recent Tasks</h2>
          <p className="text-gray-600 text-sm">No tasks yet</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Upcoming Events</h2>
          <p className="text-gray-600 text-sm">No events scheduled</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Family Members</h2>
          <p className="text-gray-600 text-sm">Setup your family</p>
        </div>
      </div>
    </div>
  )
}