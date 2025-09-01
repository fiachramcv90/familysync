export default function Family() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Family</h1>
        <p className="text-gray-600">Manage your family members and settings</p>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Family Setup</h2>
        <p className="text-gray-600 mb-6">
          Family management features will be implemented in Epic 1.
          This will include creating families, inviting members, and managing roles.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>• Create or join family groups</p>
          <p>• Invite family members with codes</p>
          <p>• Manage member roles and permissions</p>
          <p>• Configure family settings</p>
        </div>
      </div>
    </div>
  )
}