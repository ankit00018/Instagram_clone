import React from 'react'
import { useSelector } from 'react-redux'
import Post from './Post'

const Posts = () => {
  // Add safe state access with default empty array
  const posts = useSelector((state) => state.post?.posts) || []

  // Handle loading state explicitly
  const isLoading = useSelector((state) => state.post?.loading)

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="mt-4">Loading posts...</p>
      </div>
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        No posts available yet. Be the first to share something!
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Post key={post._id} post={post} />
      ))}
    </div>
  )
}

export default Posts