export default function Tasks() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
        <p className="text-gray-600">Manage family tasks and assignments</p>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Task Management</h2>
        <p className="text-gray-600 mb-6">
          Task management features will be implemented in Epic 2.
          This will include creating, assigning, and tracking family tasks.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>• Create and assign tasks to family members</p>
          <p>• Set due dates and priorities</p>
          <p>• Track completion status</p>
          <p>• Send notifications for overdue tasks</p>
        </div>
      </div>
    </div>
  )
}