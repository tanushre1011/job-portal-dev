"use client"

import { useState, useEffect } from "react"
import { EditProfileModal } from "@/components/EditProfileModal"
import { JobRecommendations } from "@/components/JobRecommendations"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user profile from MongoDB
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

      try {
        const res = await fetch("/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.ok) {
          const data = await res.json()
          setProfile(data)
        } else {
          console.error("Failed to fetch profile")
        }
      } catch (err) {
        console.error("Error fetching profile:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSave = (updatedProfile: any) => {
    setProfile(updatedProfile)
  }

  if (loading) return <p className="text-center py-4">Loading profile…</p>
  if (!profile) return <p className="text-center py-4">No profile found</p>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        Welcome, {profile.firstName} {profile.lastName}
      </h1>
      <Button onClick={() => setModalOpen(true)}>Edit Profile</Button>

      <EditProfileModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        profile={profile}
        onSave={handleSave}
      />

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Job Recommendations</h2>
        <JobRecommendations />
      </div>
    </div>
  )
}
