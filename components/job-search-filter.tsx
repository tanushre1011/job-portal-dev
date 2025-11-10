"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"

interface SearchFilters {
  search: string
  location: string
  jobType: string
  skills: string
}

interface JobSearchFilterProps {
  onSearch: (filters: SearchFilters) => void
  isLoading?: boolean
}

export function JobSearchFilter({ onSearch, isLoading }: JobSearchFilterProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    search: "",
    location: "",
    jobType: "",
    skills: "",
  })

  const handleSearch = useCallback(() => {
    onSearch(filters)
  }, [filters, onSearch])

  const handleReset = () => {
    const emptyFilters = {
      search: "",
      location: "",
      jobType: "",
      skills: "",
    }
    setFilters(emptyFilters)
    onSearch(emptyFilters)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Input
          placeholder="Job title or company..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />

        <Input
          placeholder="Location..."
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />

        <Select value={filters.jobType} onValueChange={(value) => setFilters({ ...filters, jobType: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Job Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="full-time">Full-time</SelectItem>
            <SelectItem value="part-time">Part-time</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="internship">Internship</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Skills (comma-separated)..."
          value={filters.skills}
          onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSearch} disabled={isLoading} className="gap-2">
          <Search className="w-4 h-4" />
          Search
        </Button>
        <Button variant="outline" onClick={handleReset} disabled={isLoading}>
          <X className="w-4 h-4" />
          Reset
        </Button>
      </div>
    </div>
  )
}
