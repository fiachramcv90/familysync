export default function Auth() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to FamilySync
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to coordinate with your family
          </p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600">
                Authentication will be implemented with Supabase Auth in the next story.
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50" disabled>
                Sign in with Email
              </button>
              <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:opacity-50" disabled>
                Sign in with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}