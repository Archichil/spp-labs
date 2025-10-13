import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../services/api'

export default function Profile() {
  const { user, updateProfile, changePassword } = useAuth()
  
  const [username, setUsername] = useState(user?.username || '')
  const [email, setEmail] = useState(user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    if (user) {
      setUsername(user.username)
      setEmail(user.email)
    }
  }, [user])

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')
    setIsUpdatingProfile(true)

    try {
      await updateProfile({ username, email })
      setProfileSuccess('Profile updated successfully!')
    } catch (err) {
      if (err instanceof ApiError) {
        setProfileError(err.message)
      } else {
        setProfileError('Failed to update profile. Please try again.')
      }
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }

    setIsChangingPassword(true)

    try {
      await changePassword(currentPassword, newPassword)
      setPasswordSuccess('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err) {
      if (err instanceof ApiError) {
        setPasswordError(err.message)
      } else {
        setPasswordError('Failed to change password. Please try again.')
      }
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (!user) {
    return (
      <section className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Please login to view your profile.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="max-w-4xl mx-auto p-6 space-y-8">
      <h2 className="text-3xl font-bold text-gray-900">User Profile</h2>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-gray-500">User ID:</span>
            <p className="text-gray-900 font-mono text-sm">{user.id}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Role:</span>
            <p className="text-gray-900">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Update Profile Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Update Profile</h3>
        
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          {profileError && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{profileError}</div>
            </div>
          )}
          
          {profileSuccess && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-800">{profileSuccess}</div>
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isUpdatingProfile}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isUpdatingProfile}
            />
          </div>

          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h3>
        
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {passwordError && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{passwordError}</div>
            </div>
          )}
          
          {passwordSuccess && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-800">{passwordSuccess}</div>
            </div>
          )}

          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isChangingPassword}
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isChangingPassword}
            />
          </div>

          <div>
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input
              id="confirmNewPassword"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              disabled={isChangingPassword}
            />
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChangingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </section>
  )
}


