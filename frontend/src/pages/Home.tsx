import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { isAuthenticated, user } = useAuth()

  return (
    <section className="max-w-4xl mx-auto">
      <div className="text-center py-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Project Management System
        </h2>
        
        {isAuthenticated ? (
          <>
            <p className="text-xl text-gray-600 mb-8">
              Welcome back, <span className="font-semibold text-indigo-600">{user?.username}</span>!
            </p>
            <div className="space-x-4">
              <Link
                to="/projects"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                View Projects
              </Link>
              <Link
                to="/profile"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                My Profile
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-xl text-gray-600 mb-8">
              Organize and manage your projects with ease.
            </p>
            <div className="space-x-4">
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Create Account
              </Link>
            </div>
          </>
        )}

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Role-Based Access
            </h3>
            <p className="text-gray-600 text-sm">
              Different permissions for users, managers, and admins.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Task Management
            </h3>
            <p className="text-gray-600 text-sm">
              Organize tasks with status tracking and assignments.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Secure Authentication
            </h3>
            <p className="text-gray-600 text-sm">
              JWT-based authentication with refresh tokens.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}


