"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Briefcase, Users, TrendingUp } from "lucide-react"

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        const userId = localStorage.getItem("userId")

        if (!token) return

        // Fetch employer's jobs
        const jobsResponse = await fetch(`/api/jobs?employerId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const jobsData = await jobsResponse.json()
        setJobs(jobsData.jobs || [])

        // Fetch applications
        const appResponse = await fetch(`/api/applications?employerId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const appData = await appResponse.json()
        setApplications(appData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        setApplications(applications.map((app) => (app._id === applicationId ? { ...app, status } : app)))
      }
    } catch (error) {
      console.error("Error updating application:", error)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-muted-foreground">Loading dashboard...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-8 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Employer Dashboard</h1>
          <p className="text-muted-foreground">Manage your job postings and applications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobs.filter((j) => j.status === "active").length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobs.reduce((sum, job) => sum + (job.viewCount || 0), 0)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="jobs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="jobs">My Jobs</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Job Postings</CardTitle>
                  <Link href="/employer/post-job">
                    <Button>Post New Job</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {jobs.length > 0 ? (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div key={job._id} className="border rounded-lg p-4 flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{job.title}</h3>
                          <p className="text-sm text-muted-foreground">{job.location}</p>
                          <div className="mt-2 flex gap-2">
                            <Badge variant={job.status === "active" ? "default" : "outline"}>{job.status}</Badge>
                            <span className="text-xs text-muted-foreground">{job.applicantCount} applications</span>
                          </div>
                        </div>
                        <Link href={`/employer/jobs/${job._id}`}>
                          <Button variant="outline">Edit</Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No jobs posted yet</p>
                    <Link href="/employer/post-job">
                      <Button>Post Your First Job</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div key={app._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold">
                              {app.jobSeekerId?.firstName} {app.jobSeekerId?.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">Applied for: {app.jobId?.title}</p>
                            <div className="mt-2">
                              <Badge
                                variant="secondary"
                                className={
                                  app.matchScore >= 70
                                    ? "bg-green-600/10 text-green-700"
                                    : "bg-yellow-600/10 text-yellow-700"
                                }
                              >
                                {app.matchScore}% Match
                              </Badge>
                            </div>
                          </div>
                          <select
                            value={app.status}
                            onChange={(e) => updateApplicationStatus(app._id, e.target.value)}
                            className="border rounded px-3 py-2 text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="rejected">Rejected</option>
                            <option value="accepted">Accepted</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No applications yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
