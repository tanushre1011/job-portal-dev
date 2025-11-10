"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResumeUpload } from "@/components/resume-upload"
import { JobRecommendations } from "@/components/job-recommendations"
import { AIInsightsPanel } from "@/components/ai-insights-panel"
import { BookmarkIcon, FileText, Settings, LogOut, Briefcase } from "lucide-react"

interface UserProfile {
  _id: string
  firstName: string
  lastName: string
  email: string
  skills: string[]
  experience: number
  location?: string
  bio?: string
  profileImage?: string
  resume?: {
    url: string
    uploadedAt: string
    parsedData?: {
      skills: string[]
      experience: number
      education: string[]
    }
  }
}

interface SavedJob {
  _id: string
  title: string
  company: string
  location: string
}

export default function JobSeekerDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        const userId = localStorage.getItem("userId")

        if (!token || !userId) {
          router.push("/auth/login")
          return
        }

        // Fetch user profile
        const response = await fetch(`/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const userData = await response.json()
          setProfile(userData)
        } else {
          router.push("/auth/login")
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    router.push("/")
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center">User profile not found</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold">Job Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {profile.firstName} {profile.lastName}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Summary Card */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-3xl">
                {profile.firstName} {profile.lastName}
              </CardTitle>
              <CardDescription>{profile.email}</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Experience</p>
                <p className="text-2xl font-bold">{profile.experience || 0}</p>
                <p className="text-xs text-muted-foreground">years</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Skills</p>
                <p className="text-2xl font-bold">{profile.skills?.length || 0}</p>
                <p className="text-xs text-muted-foreground">total</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="text-lg font-semibold">{profile.location || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resume</p>
                <p className="text-lg font-semibold">{profile.resume ? "Uploaded" : "Pending"}</p>
              </div>
            </div>

            {/* Skills Display */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium mb-3">Your Skills</p>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="resume">Resume</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    Browse All Jobs
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <BookmarkIcon className="w-4 h-4 mr-2" />
                    Saved Jobs ({savedJobs.length})
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Applications
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Profile Completeness</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Profile</span>
                      <span className="text-sm text-muted-foreground">75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                  </div>
                  {profile.resume && <p className="text-sm text-green-700">✓ Resume uploaded and parsed</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {!profile.resume && <p className="text-amber-700">1. Upload your resume</p>}
                  <p>2. Explore personalized job recommendations</p>
                  <p>3. Get AI-powered career insights</p>
                  <p>4. Apply to matching positions</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="mt-6">
            <JobRecommendations />
          </TabsContent>

          {/* Resume Tab */}
          <TabsContent value="resume" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <ResumeUpload
                onUploadSuccess={() => {
                  // Refresh profile data after resume upload
                  window.location.reload()
                }}
              />

              {profile.resume?.parsedData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Resume Information</CardTitle>
                    <CardDescription>Extracted from your uploaded resume</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Skills Detected</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profile.resume.parsedData.skills?.map((skill) => (
                          <span key={skill} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {profile.resume.parsedData.experience && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Experience</p>
                        <p className="text-lg font-bold">{profile.resume.parsedData.experience} years</p>
                      </div>
                    )}

                    {profile.resume.parsedData.education && profile.resume.parsedData.education.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Education</p>
                        <ul className="text-sm space-y-1 mt-2">
                          {profile.resume.parsedData.education.map((edu, i) => (
                            <li key={i} className="text-foreground">
                              • {edu}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai-insights" className="mt-6">
            <AIInsightsPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
