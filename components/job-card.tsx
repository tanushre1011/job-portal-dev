"use client"

import { DollarSign, Briefcase } from "lucide-react"

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
  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
      <h2 className="text-lg font-semibold mb-1">{props.title}</h2>
      <p className="text-sm text-muted-foreground mb-2">{props.company}</p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <Briefcase className="w-3 h-3" />
        <span>{props.jobType}</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
        {/*<DollarSign className="w-3 h-3" />*/}
        <span>
          {props.salary.min}-{props.salary.max} {props.salary.currency}
        </span>
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {props.skills.map((skill, i) => (
          <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
            {skill}
          </span>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">{props.description}</p>

      {/* Removed View Details button */}
    </div>
  )
}
