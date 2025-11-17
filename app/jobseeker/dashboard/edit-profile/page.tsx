"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function EditProfile() {
  const router = useRouter()

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    location: "",
    experience: 0,
    skills: ""
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userId = localStorage.getItem("userId")

    fetch(`/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProfile({
          firstName: data.firstName,
          lastName: data.lastName,
          location: data.location || "",
          experience: data.experience || 0,
          skills: data.skills?.join(", ") || ""
        })
      })
  }, [])

  const handleSave = async () => {
    const token = localStorage.getItem("token")
    const userId = localStorage.getItem("userId")

    await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        ...profile,
        skills: profile.skills.split(",").map(s => s.trim())
      })
    })

    router.push("/jobseeker/dashboard")
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            placeholder="First Name"
            value={profile.firstName}
            onChange={e => setProfile({ ...profile, firstName: e.target.value })}
          />

          <Input
            placeholder="Last Name"
            value={profile.lastName}
            onChange={e => setProfile({ ...profile, lastName: e.target.value })}
          />

          <Input
            placeholder="Location"
            value={profile.location}
            onChange={e => setProfile({ ...profile, location: e.target.value })}
          />

          <Input
            placeholder="Experience (years)"
            type="number"
            value={profile.experience}
            onChange={e => setProfile({ ...profile, experience: Number(e.target.value) })}
          />

          <Input
            placeholder="Skills (comma separated)"
            value={profile.skills}
            onChange={e => setProfile({ ...profile, skills: e.target.value })}
          />

          <Button onClick={handleSave} className="w-full">
            Save Changes
          </Button>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => router.push("/jobseeker/dashboard")}
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
