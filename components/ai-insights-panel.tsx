"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Loader2 } from "lucide-react"

export function AIInsightsPanel({ jobId }: { jobId?: string }) {
  const [activeTab, setActiveTab] = useState("resume")
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState<{ [key: string]: string }>({})

  const fetchInsights = async (type: string) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      let url = ""

      if (type === "resume") {
        url = "/api/ai/analyze-resume"
      } else if (type === "job" && jobId) {
        url = `/api/ai/job-insights?jobId=${jobId}`
      } else if (type === "career") {
        url = "/api/ai/career-advice"
      }

      if (!url) return

      const response = await fetch(url, {
        method: type === "resume" ? "POST" : "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to get insights")
      }

      const data = await response.json()
      const insightText = data.analysis || data.insights || data.advice

      setContent({
        ...content,
        [type]: insightText,
      })
    } catch (error) {
      console.error("Error fetching insights:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <CardTitle>AI Insights</CardTitle>
        </div>
        <CardDescription>Get AI-powered personalized recommendations and advice</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
           
            <TabsTrigger value="resume"><b> RESUME </b></TabsTrigger>
            <TabsTrigger value=" ">  </TabsTrigger>
            
            <TabsTrigger value="career"> <b> CAREER </b></TabsTrigger>
          </TabsList>

          <TabsContent value="resume" className="space-y-4 mt-4">
            <Button onClick={() => fetchInsights("resume")} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze Resume
                </>
              )}
            </Button>
            {content.resume && (
              <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm max-h-96 overflow-y-auto">
                {content.resume}
              </div>
            )}
          </TabsContent>

          <TabsContent value="job" className="space-y-4 mt-4">
            <Button onClick={() => fetchInsights("job")} disabled={loading || !jobId} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Job Insights
                </>
              )}
            </Button>
            {content.job && (
              <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm max-h-96 overflow-y-auto">
                {content.job}
              </div>
            )}
          </TabsContent>

          <TabsContent value="career" className="space-y-4 mt-4">
            <Button onClick={() => fetchInsights("career")} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Career Advice
                </>
              )}
            </Button>
            {content.career && (
              <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm max-h-96 overflow-y-auto">
                {content.career}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
