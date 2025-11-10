"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, CheckCircle, AlertCircle } from "lucide-react"

export function ResumeUpload({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type.includes("pdf") || selectedFile.type.includes("text")) {
        setFile(selectedFile)
        setError(null)
      } else {
        setError("Please select a PDF or text file")
      }
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const token = localStorage.getItem("token")
      const response = await fetch("/api/resume/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload resume")
      }

      const data = await response.json()
      setSuccess(true)
      setFile(null)

      if (onUploadSuccess) {
        onUploadSuccess()
      }

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Your Resume</CardTitle>
        <CardDescription>Upload a PDF or text file to help employers find you</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {success ? (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-700">Resume uploaded successfully!</p>
          </div>
        ) : (
          <>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-blue-400 transition">
              <input type="file" accept=".pdf,.txt" onChange={handleFileSelect} className="hidden" id="resume-input" />
              <label htmlFor="resume-input" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm font-medium">{file ? file.name : "Click to upload or drag and drop"}</span>
                <span className="text-xs text-muted-foreground">PDF or TXT files only</span>
              </label>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button onClick={handleUpload} disabled={!file || loading} className="w-full">
              {loading ? "Uploading..." : "Upload Resume"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
