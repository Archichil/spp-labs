import { useState, useEffect } from 'react'
import { usersApi, projectMembersApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { User, ProjectMember } from '../types'

interface ProjectMembersProps {
  projectId: string
  onMembersChange?: () => void
}

export default function ProjectMembers({ projectId, onMembersChange }: ProjectMembersProps) {
  const { user } = useAuth()
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager'

  useEffect(() => {
    loadData()
  }, [projectId])

  const loadData = async () => {
    setIsLoading(true)
    setError('')
    try {
      const [membersData, usersData] = await Promise.all([
        projectMembersApi.getMembers(projectId),
        isAdminOrManager ? usersApi.getAll() : Promise.resolve([])
      ])
      setMembers(membersData)
      setAllUsers(usersData)
    } catch (err: any) {
      setError(err.message || 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMember = async () => {
    if (!selectedUserId) return

    setIsAdding(true)
    setError('')
    try {
      await projectMembersApi.addMember(projectId, selectedUserId)
      setSelectedUserId('')
      await loadData()
      onMembersChange?.()
    } catch (err: any) {
      setError(err.message || 'Failed to add member')
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    setError('')
    try {
      await projectMembersApi.removeMember(projectId, userId)
      await loadData()
      onMembersChange?.()
    } catch (err: any) {
      setError(err.message || 'Failed to remove member')
    }
  }

  const availableUsers = allUsers.filter(
    u => !members.some(m => m.id === u.id)
  )

  if (isLoading) {
    return <div className="text-gray-600">Loading members...</div>
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Members</h3>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {/* Members List */}
      <div className="space-y-2 mb-4">
        {members.length === 0 ? (
          <p className="text-sm text-gray-500">No members added yet.</p>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">{member.username}</p>
                <p className="text-sm text-gray-500">{member.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    member.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : member.role === 'manager'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {member.role}
                </span>
                {isAdminOrManager && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Member Form (Admin/Manager only) */}
      {isAdminOrManager && availableUsers.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Add Member</h4>
          <div className="flex gap-2">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="flex-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              disabled={isAdding}
            >
              <option value="">Select a user...</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.email}) - {user.role}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddMember}
              disabled={!selectedUserId || isAdding}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAdding ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
