// BlogList.tsx
import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  "https://qymwwejktzsupggijcbq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5bXd3ZWprdHpzdXBnZ2lqY2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk0NDA2NDYsImV4cCI6MjAxNTAxNjY0Nn0.gBvcczkJ0BhjyktG2ejT7d54B2FhnMLChpUPt4Qx3h0"
)

const POSTS_PER_PAGE = 5

const BlogList = () => {
  const [posts, setPosts] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    supabase
      .from("static_pages")
      .select("*", { count: "exact" })
      .eq("type", "blog")
      .order("created_at", { ascending: false })
      .range((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE - 1)
      .then(({ data, count }) => {
        if (data) setPosts(data)
        if (count) setTotalPages(Math.ceil(count / POSTS_PER_PAGE))
      })
  }, [currentPage])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>
      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              to={`/blog/${post.slug}`}
              className="text-blue-600 hover:underline text-xl"
            >
              {post.title}
            </Link>
            <p className="text-gray-600 text-sm">{post.description}</p>
          </li>
        ))}
      </ul>
      <div className="flex justify-center space-x-2 mt-8">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Előző
        </button>
        <span className="px-4 py-2">{currentPage} / {totalPages}</span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Következő
        </button>
      </div>
    </div>
  )
}

export default BlogList;


// BlogPost.tsx
import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  "https://qymwwejktzsupggijcbq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5bXd3ZWprdHpzdXBnZ2lqY2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk0NDA2NDYsImV4cCI6MjAxNTAxNjY0Nn0.gBvcczkJ0BhjyktG2ejT7d54B2FhnMLChpUPt4Qx3h0"
)

const BlogPost = () => {
  const { slug } = useParams()
  const [post, setPost] = useState(null)

  useEffect(() => {
    supabase
      .from("static_pages")
      .select("*")
      .eq("slug", slug)
      .single()
      .then(({ data }) => {
        if (data) setPost(data)
      })
  }, [slug])

  if (!post) return <p className="p-4">Töltés...</p>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      ></div>
    </div>
  )
}

export default BlogPost;
