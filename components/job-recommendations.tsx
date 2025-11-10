"use client"

import { useEffect, useState } from "react"
import { JobCard } from "@/components/job-card"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

interface Job {
  _id: string
  title: string
  company: string
  location: string
  jobType: string
  salary: { min: number; max: number; currency: string }
  skills: string[]
  description: string
  matchScore: number
}

export function JobRecommendations() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecommendations = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/search/recommend", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations")
      }

      const data = await response.json()
      setJobs(data.recommendations || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading recommendations")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecommendations()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading recommendations...</div>
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <span className="text-red-700">{error}</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recommended Jobs</h2>
        <Button variant="outline" size="sm" onClick={fetchRecommendations} className="gap-2 bg-transparent">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {jobs.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <div key={job._id} className="relative">
              <JobCard
                id={job._id}
                title={job.title}
                company={job.company}
                location={job.location}
                jobType={job.jobType}
                salary={job.salary}
                skills={job.skills}
                description={job.description}
              />
              <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {job.matchScore}% Match
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted rounded-lg">
          <p className="text-muted-foreground">
            No matching jobs found. Update your skills to get better recommendations.
          </p>
        </div>
      )}
    </div>
  )
}
