import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { usersApi } from '../services/api'
import type { User, UserRole } from '../types'
import { useNavigate } from 'react-router-dom'

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      navigate('/projects')
      return
    }

    void fetchUsers()
  }, [currentUser, navigate])

  async function fetchUsers() {
    try {
      setLoading(true)
      setError(null)
      const data = await usersApi.getAll()
      setUsers(data)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  async function handleRoleChange(userId: string, newRole: UserRole) {
    if (userId === currentUser?.id) {
      alert('You cannot change your own role')
      return
    }

    try {
      setUpdatingUserId(userId)
      const updatedUser = await usersApi.updateRole(userId, newRole)
      setUsers(users.map(u => u.id === userId ? updatedUser : u))
    } catch (err) {
      console.error('Error updating role:', err)
      alert('Failed to update user role')
    } finally {
      setUpdatingUserId(null)
    }
  }

  function getRoleBadgeColor(role: UserRole) {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'manager':
        return 'bg-blue-100 text-blue-800'
      case 'user':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div>
        <h2 className="mb-4 text-2xl font-semibold">User Management</h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading users...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h2 className="mb-4 text-2xl font-semibold">User Management</h2>
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <div className="text-red-800">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">User Management</h2>
        <p className="text-sm text-gray-600 mt-1">Manage user roles and permissions</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Change Role
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className={user.id === currentUser?.id ? 'bg-blue-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">
                      {user.username}
                      {user.id === currentUser?.id && (
                        <span className="ml-2 text-xs text-blue-600">(You)</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                    disabled={user.id === currentUser?.id || updatingUserId === user.id}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                  {updatingUserId === user.id && (
                    <div className="text-xs text-gray-500 mt-1">Updating...</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No users found
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Role Descriptions:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li><strong>User:</strong> Can view projects they are members of and manage their own tasks</li>
          <li><strong>Manager:</strong> Can create and manage projects, and add members to projects</li>
          <li><strong>Admin:</strong> Full system access, including user management</li>
        </ul>
      </div>
    </div>
  )
}
