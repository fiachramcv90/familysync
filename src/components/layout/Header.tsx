import Link from 'next/link'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">
            FamilySync
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Link href="/tasks" className="text-gray-600 hover:text-gray-900">
              Tasks
            </Link>
            <Link href="/events" className="text-gray-600 hover:text-gray-900">
              Events
            </Link>
            <Link href="/family" className="text-gray-600 hover:text-gray-900">
              Family
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/auth" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}