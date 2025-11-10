"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Briefcase, DollarSign, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"

export default function JobDetailPage() {
  const params = useParams()
  const jobId = params.id as string
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")
  const [applied, setApplied] = useState(false)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`)
        const data = await response.json()
        setJob(data)
      } catch (error) {
        console.error("Error fetching job:", error)
      } finally {
        setLoading(false)
      }
    }

    if (jobId) {
      fetchJob()
    }
  }, [jobId])

  const handleApply = async () => {
    setApplying(true)
    try {
      const token = localStorage.getItem("token")
      const userId = localStorage.getItem("userId")

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId,
          jobSeekerId: userId,
          coverLetter,
          resumeUrl: localStorage.getItem("resumeUrl") || "",
        }),
      })

      if (response.ok) {
        setApplied(true)
        setCoverLetter("")
      }
    } catch (error) {
      console.error("Error applying:", error)
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-muted-foreground">Loading job details...</p>
        </div>
      </main>
    )
  }

  if (!job) {
    return (
      <main className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-muted-foreground">Job not found</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-8 px-4 bg-background">
      <div className="max-w-4xl mx-auto">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </Link>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">{job.title}</CardTitle>
                <p className="text-lg text-muted-foreground mt-2">{job.company}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-muted-foreground" />
                    <span>{job.jobType}</span>
                  </div>
                  {job.salary && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-muted-foreground" />
                      <span>
                        {job.salary.currency} {job.salary.min?.toLocaleString()} - {job.salary.max?.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {job.applicationDeadline && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <span>{new Date(job.applicationDeadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {job.description.split("\n").map((line: string, i: number) => (
                    <p key={i} className="text-muted-foreground mb-2">
                      {line}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {job.skills && job.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill: string) => (
                      <Badge key={skill}>{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {job.benefits && job.benefits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.benefits.map((benefit: string) => (
                      <li key={benefit} className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Apply Now</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {applied ? (
                  <div className="text-center space-y-2">
                    <p className="text-green-600 font-semibold">Application Submitted!</p>
                    <p className="text-sm text-muted-foreground">The employer will review your application soon.</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-sm font-medium">Cover Letter (optional)</label>
                      <Textarea
                        placeholder="Tell the employer why you're interested..."
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        className="mt-2"
                        rows={4}
                      />
                    </div>
                    <Button onClick={handleApply} disabled={applying} className="w-full" size="lg">
                      {applying ? "Submitting..." : "Submit Application"}
                    </Button>
                    <Link href="/auth/login">
                      <Button variant="outline" className="w-full bg-transparent">
                        Sign In to Apply
                      </Button>
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
