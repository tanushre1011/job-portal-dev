"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function EditProfileModal({ open, onClose, profile, onSave }: any) {
  const [form, setForm] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    location: profile.location || "",
    experience: profile.experience || 0,
    skills: profile.skills?.join(", ") || ""
  })
  const [saving, setSaving] = useState(false)

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setSaving(true)
    const updatedProfile = {
      ...form,
      skills: form.skills.split(",").map((s) => s.trim())
    }

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProfile),
      })

      if (res.ok) {
        const data = await res.json()
        onSave(data)
        onClose()
      } else {
        console.error("Failed to save profile")
      }
    } catch (err) {
      console.error("Error saving profile:", err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" />
          <Input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" />
          <Input name="location" value={form.location} onChange={handleChange} placeholder="Location" />
          <Input name="experience" type="number" value={form.experience} onChange={handleChange} placeholder="Experience (years)" />
          <Input name="skills" value={form.skills} onChange={handleChange} placeholder="Skills (comma separated)" />

          <Button onClick={handleSubmit} className="w-full" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
