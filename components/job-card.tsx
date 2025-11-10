"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, DollarSign, Briefcase, BookmarkIcon } from "lucide-react"
import { useState } from "react"

interface JobCardProps {
  id: string
  title: string
  company: string
  location: string
  jobType: string
  salary: { min: number; max: number; currency: string }
  skills: string[]
  description: string
}

export function JobCard(props: JobCardProps) {
  const [isSaved, setIsSaved] = useState(false)

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg line-clamp-2">{props.title}</h3>
            <p className="text-sm text-muted-foreground">{props.company}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSaved(!isSaved)}
            className={isSaved ? "text-blue-600" : ""}
          >
            <BookmarkIcon className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            {props.location}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Briefcase className="w-3 h-3" />
            {props.jobType}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <DollarSign className="w-3 h-3" />
            {props.salary.min}-{props.salary.max} {props.salary.currency}
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{props.description}</p>

        <div className="flex flex-wrap gap-1">
          {props.skills.slice(0, 3).map((skill) => (
            <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
              {skill}
            </span>
          ))}
          {props.skills.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">+{props.skills.length - 3}</span>
          )}
        </div>

        <Link href={`/jobs/${props.id}`}>
          <Button className="w-full">View Details</Button>
        </Link>
      </CardContent>
    </Card>
  )
}
