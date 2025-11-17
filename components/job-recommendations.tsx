"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Job {
  job_id: string
  employer_name: string
  job_title: string
  job_city: string
  job_country: string
  job_apply_link: string
}

export function JobRecommendations() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const skillsString = localStorage.getItem("skills")
        const skills = skillsString ? JSON.parse(skillsString) : []

        const response = await fetch("/api/job-recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skills }),
        })

        const data = await response.json()
        setJobs(data.jobs || [])
      } catch (err) {
        console.error("Error fetching recommendations:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [])

  if (loading) {
    return <p className="text-center py-4">Loading recommendations…</p>
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {jobs.length === 0 && (
        <p className="col-span-full text-muted-foreground">No recommendations found.</p>
      )}

      {jobs.map((job) => (
        <Card key={job.job_id} className="shadow-sm">
          <CardHeader>
            <CardTitle>{job.job_title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{job.employer_name}</p>
            <p className="text-sm text-muted-foreground">
              {job.job_city}, {job.job_country}
            </p>

            <Button asChild className="mt-3 w-full">
              <a href={job.job_apply_link} target="_blank">
                Apply Now
              </a>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
