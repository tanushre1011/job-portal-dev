"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Job {
  _id: string
  title: string
  company: string
  location: string
  matchScore: number
  skills: string[]
  job_apply_link?: string
}

export function JobRecommendations() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

      try {
        const res = await fetch("/api/search/recommend", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          console.error("Failed to fetch recommendations")
          setJobs([])
          return
        }

        const data = await res.json()
        setJobs(data.recommendations || [])
      } catch (err) {
        console.error("Error fetching recommendations:", err)
        setJobs([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [])

  if (loading) return <p className="text-center py-4">Loading recommendations…</p>
  if (jobs.length === 0)
    return (
      <p className="text-center py-4 text-muted-foreground">
        No recommendations found. Please update your profile skills.
      </p>
    )

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {jobs.map((job) => (
        <Card key={job._id} className="shadow-sm">
          <CardHeader>
            <CardTitle>{job.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{job.company}</p>
            <p className="text-sm text-muted-foreground">{job.location}</p>
            <p className="text-sm text-blue-600 font-semibold">
              Match: {job.matchScore}%
            </p>

            {job.skills && job.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {job.skills.slice(0, 5).map((skill) => (
                  <Badge key={skill}>{skill}</Badge>
                ))}
                {job.skills.length > 5 && (
                  <Badge>+{job.skills.length - 5}</Badge>
                )}
              </div>
            )}

            <Button asChild className="mt-3 w-full">
              <a href={job.job_apply_link || "#"} target="_blank">
                Apply Now
              </a>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
