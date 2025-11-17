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

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = () => {
    const updated = {
      ...form,
      skills: form.skills.split(",").map((s) => s.trim())
    }
    onSave(updated)
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

          <Button onClick={handleSubmit} className="w-full">Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
