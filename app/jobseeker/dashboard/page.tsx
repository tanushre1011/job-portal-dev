"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, LogOut } from "lucide-react"

export default function JobSeekerDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userId = localStorage.getItem("userId")

    if (!token || !userId) {
      router.push("/auth/login")
      return
    }

    fetch(`/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProfile(data))
  }, [])

  if (!profile) return <div>Loading...</div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex justify-between">
          <div>
            <CardTitle className="text-3xl">
              {profile.firstName} {profile.lastName}
            </CardTitle>
            <CardDescription>{profile.email}</CardDescription>
          </div>

          <Button 
            variant="outline" 
            onClick={() => router.push("/jobseeker/dashboard/edit-profile")}
          >
            <Settings className="mr-2 w-4 h-4" />
            Edit Profile
          </Button>
        </CardHeader>

        <CardContent>
          <p><b>Location:</b> {profile.location || "Not set"}</p>
          <p><b>Experience:</b> {profile.experience || 0} years</p>
          <p><b>Skills:</b> {profile.skills?.join(", ") || "None"}</p>
        </CardContent>
      </Card>

      <div className="mt-4">
        <Button 
          variant="destructive"
          onClick={() => {
            localStorage.clear()
            router.push("/")
          }}
        >
          <LogOut className="mr-2 w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
