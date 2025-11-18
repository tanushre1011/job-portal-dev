"use client"

import { useState, useEffect } from "react"
import { JobCard } from "@/components/job-card"
import { JobSearchFilter } from "@/components/job-search-filter"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Briefcase } from "lucide-react"

interface SearchFilters {
  search: string
  location: string
  jobType: string
  skills: string
}

export default function Home() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  // Pre-populate 20 jobs
  const initialJobs = [
    { _id: "1", title: "Frontend Developer", company: "TechCorp", location: "Bangalore", jobType: "full-time", salary: { min: 50000, max: 80000, currency: "INR" }, skills: ["React", "Next.js", "TypeScript"], description: "Build modern web applications using React and Next.js" },
    { _id: "2", title: "Backend Developer", company: "DataSolutions", location: "Mumbai", jobType: "full-time", salary: { min: 60000, max: 90000, currency: "INR" }, skills: ["Node.js", "Express", "MongoDB"], description: "Develop scalable backend APIs using Node.js and Express" },
    { _id: "3", title: "UI/UX Designer", company: "DesignPro", location: "Hyderabad", jobType: "internship", salary: { min: 20000, max: 30000, currency: "INR" }, skills: ["Figma", "Adobe XD", "Prototyping"], description: "Create user-friendly UI/UX designs for web and mobile apps" },
    { _id: "4", title: "Full Stack Developer", company: "InnovateTech", location: "Bangalore", jobType: "full-time", salary: { min: 55000, max: 90000, currency: "INR" }, skills: ["React", "Node.js", "MongoDB"], description: "Work on both frontend and backend systems" },
    { _id: "5", title: "Data Scientist", company: "AI Labs", location: "Hyderabad", jobType: "full-time", salary: { min: 70000, max: 120000, currency: "INR" }, skills: ["Python", "Machine Learning", "TensorFlow"], description: "Analyze data and build predictive models" },
    { _id: "6", title: "DevOps Engineer", company: "CloudOps", location: "Mumbai", jobType: "full-time", salary: { min: 60000, max: 100000, currency: "INR" }, skills: ["AWS", "Docker", "Kubernetes"], description: "Maintain cloud infrastructure and CI/CD pipelines" },
    { _id: "7", title: "Mobile App Developer", company: "AppWorks", location: "Bangalore", jobType: "contract", salary: { min: 45000, max: 80000, currency: "INR" }, skills: ["React Native", "Flutter", "JavaScript"], description: "Develop mobile applications for iOS and Android" },
    { _id: "8", title: "QA Engineer", company: "TestPro", location: "Hyderabad", jobType: "full-time", salary: { min: 40000, max: 70000, currency: "INR" }, skills: ["Selenium", "Cypress", "Jest"], description: "Test web and mobile applications for quality assurance" },
    { _id: "9", title: "Product Manager", company: "NextGen Products", location: "Bangalore", jobType: "full-time", salary: { min: 80000, max: 150000, currency: "INR" }, skills: ["Agile", "Scrum", "Roadmapping"], description: "Oversee product development from concept to release" },
    { _id: "10", title: "Marketing Specialist", company: "BrandBoost", location: "Mumbai", jobType: "part-time", salary: { min: 30000, max: 50000, currency: "INR" }, skills: ["SEO", "Content Marketing", "Social Media"], description: "Plan and execute marketing campaigns" },
    { _id: "11", title: "Cloud Architect", company: "SkyNet Solutions", location: "Bangalore", jobType: "full-time", salary: { min: 90000, max: 140000, currency: "INR" }, skills: ["AWS", "Azure", "Cloud Design"], description: "Design and manage cloud architecture for enterprise apps" },
    { _id: "12", title: "AI Engineer", company: "DeepThink", location: "Hyderabad", jobType: "full-time", salary: { min: 80000, max: 130000, currency: "INR" }, skills: ["Python", "TensorFlow", "PyTorch"], description: "Develop AI solutions for business automation" },
    { _id: "13", title: "Blockchain Developer", company: "CryptoWorks", location: "Remote", jobType: "contract", salary: { min: 70000, max: 120000, currency: "INR" }, skills: ["Solidity", "Ethereum", "Smart Contracts"], description: "Develop blockchain-based applications and smart contracts" },
    { _id: "14", title: "Technical Writer", company: "DocuTech", location: "Mumbai", jobType: "part-time", salary: { min: 30000, max: 50000, currency: "INR" }, skills: ["Writing", "Documentation", "Markdown"], description: "Write technical documentation for software products" },
    { _id: "15", title: "Cybersecurity Analyst", company: "SecureIT", location: "Bangalore", jobType: "full-time", salary: { min: 60000, max: 100000, currency: "INR" }, skills: ["Network Security", "Penetration Testing", "Python"], description: "Protect systems and networks from cyber threats" },
    { _id: "16", title: "Intern - Software Development", company: "InnovateTech", location: "Hyderabad", jobType: "internship", salary: { min: 15000, max: 25000, currency: "INR" }, skills: ["Python", "Django"], description: "Assist in backend development and testing" },
    { _id: "17", title: "UI Designer", company: "DesignLab", location: "Bangalore", jobType: "full-time", salary: { min: 40000, max: 70000, currency: "INR" }, skills: ["Figma", "Photoshop"], description: "Design modern interfaces for web apps" },
    { _id: "18", title: "Intern - Data Analysis", company: "DataCorp", location: "Mumbai", jobType: "internship", salary: { min: 10000, max: 20000, currency: "INR" }, skills: ["Excel", "Python"], description: "Analyze datasets and generate reports" },
    { _id: "19", title: "Social Media Manager", company: "BrandBoost", location: "Hyderabad", jobType: "part-time", salary: { min: 25000, max: 40000, currency: "INR" }, skills: ["Instagram", "Content Creation"], description: "Manage social media campaigns" },
    { _id: "20", title: "Backend Intern", company: "TechCorp", location: "Bangalore", jobType: "internship", salary: { min: 15000, max: 30000, currency: "INR" }, skills: ["Node.js", "Express"], description: "Assist backend team with API development" },
  ]

  const searchJobs = async (filters: SearchFilters) => {
    setLoading(true)
    try {
      const filtered = initialJobs.filter((job) => {
        const matchesSearch =
          filters.search === "" ||
          job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          job.company.toLowerCase().includes(filters.search.toLowerCase())

        const matchesLocation =
          filters.location === "" ||
          job.location.toLowerCase().includes(filters.location.toLowerCase())

        const matchesJobType =
          filters.jobType === "" ||
          filters.jobType === "all" ||
          job.jobType.toLowerCase() === filters.jobType.toLowerCase()

        return matchesSearch && matchesLocation && matchesJobType
      })

      setJobs(filtered)
      setTotal(filtered.length)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    searchJobs({ search: "", location: "", jobType: "", skills: "" })
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Top Hero Section */}
      <section className="py-16 px-4 border-b">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">Job Portal</h1>
            </div>
            <p className="text-xl text-muted-foreground mb-4">
              Discover your next opportunity with AI-powered job matching
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/auth/register?type=jobseeker">
              <Button size="lg">Find Jobs</Button>
            </Link>
            <Link href="/auth/register?type=employer">
              <Button size="lg" variant="outline">Post Jobs</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Explore Jobs Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-blue-600">Explore Jobs</h2>

          <JobSearchFilter onSearch={searchJobs} isLoading={loading} />

          <div className="mt-8">
            {loading ? (
              <p className="text-center text-muted-foreground py-12">Loading jobs...</p>
            ) : jobs.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => (
                  <JobCard
                    key={job._id}
                    id={job._id}
                    title={job.title}
                    company={job.company}
                    location={job.location}
                    jobType={job.jobType}
                    salary={job.salary}
                    skills={job.skills}
                    description={job.description}
                    showDetails={false} // remove "View Details"
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">
                No jobs found matching your criteria
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
