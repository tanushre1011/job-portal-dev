"use client"

import type React from "react"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userType = searchParams.get("type") || "jobseeker"

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          userType: userType === "employer" ? "employer" : "jobseeker",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("userId", data.user.id)
        localStorage.setItem("userType", data.user.userType)
        router.push(userType === "employer" ? "/employer/dashboard" : "/jobs")
      } else {
        setError(data.error || "Registration failed")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Create Account</CardTitle>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Register as {userType === "employer" ? "an Employer" : "a Job Seeker"}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}

            <Input
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />

            <Input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />

            <Input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  )
}
