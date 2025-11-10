"use client"

import { useState, useEffect } from "react"
import { JobCard } from "@/components/job-card"
import { JobSearchFilter } from "@/components/job-search-filter"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Briefcase } from "lucide-react"

interface SearchFilters {
  search: string
  location: string
  jobType: string
  skills: string
}

export default function Home() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const searchJobs = async (filters: SearchFilters) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()

      if (filters.search) params.append("search", filters.search)
      if (filters.location) params.append("location", filters.location)
      if (filters.jobType) params.append("jobType", filters.jobType)
      if (filters.skills) params.append("skills", filters.skills)

      params.append("page", "1")

      const response = await fetch(`/api/jobs?${params.toString()}`)
      const data = await response.json()

      setJobs(data.jobs || [])
      setTotal(data.total || 0)
      setCurrentPage(1)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    searchJobs({ search: "", location: "", jobType: "", skills: "" })
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Hero Section */}
      <section className="py-16 px-4 border-b">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Job Portal</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            Discover your next opportunity with AI-powered job matching
          </p>
          <div className="flex gap-4">
            <Link href="/auth/register?type=jobseeker">
              <Button size="lg">Find Jobs</Button>
            </Link>
            <Link href="/auth/register?type=employer">
              <Button size="lg" variant="outline">
                Post Jobs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <JobSearchFilter onSearch={searchJobs} isLoading={loading} />
        </div>
      </section>

      {/* Jobs Listing Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading jobs...</p>
            </div>
          ) : jobs.length > 0 ? (
            <>
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  Found {total} job{total !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => (
                  <JobCard
                    key={job._id}
                    id={job._id}
                    title={job.title}
                    company={job.company}
                    location={job.location}
                    jobType={job.jobType}
                    salary={job.salary}
                    skills={job.skills}
                    description={job.description}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No jobs found matching your criteria</p>
              <Button
                variant="outline"
                onClick={() => searchJobs({ search: "", location: "", jobType: "", skills: "" })}
              >
                View All Jobs
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
