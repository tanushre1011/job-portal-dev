// Resume parsing utility using regex and text analysis
export interface ParsedResume {
  skills: string[]
  experience: number
  education: string[]
  email?: string
  phone?: string
}

const commonSkills = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "Java",
  "C++",
  "SQL",
  "MongoDB",
  "PostgreSQL",
  "AWS",
  "Azure",
  "Docker",
  "Kubernetes",
  "Git",
  "REST API",
  "GraphQL",
  "HTML",
  "CSS",
  "Vue.js",
  "Angular",
  "Express",
  "Django",
  "Flask",
  "Spring",
  "Microservices",
  "CI/CD",
  "Jenkins",
  "Linux",
  "Windows",
  "Agile",
  "Scrum",
  "Project Management",
  "Leadership",
  "Communication",
  "Problem Solving",
  "Data Analysis",
  "Machine Learning",
  "Artificial Intelligence",
  "Cloud Computing",
  "DevOps",
  "Testing",
  "Debugging",
  "Performance Optimization",
]

export async function parseResumeText(text: string): Promise<ParsedResume> {
  const parsed: ParsedResume = {
    skills: [],
    experience: 0,
    education: [],
  }

  // Extract email
  const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi)
  if (emailMatch) {
    parsed.email = emailMatch[0]
  }

  // Extract phone
  const phoneMatch = text.match(/(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/gi)
  if (phoneMatch) {
    parsed.phone = phoneMatch[0]
  }

  // Extract skills by matching against common skills list
  commonSkills.forEach((skill) => {
    if (text.toLowerCase().includes(skill.toLowerCase())) {
      parsed.skills.push(skill)
    }
  })

  // Extract education (look for degree patterns)
  const degreePatterns = [
    /Bachelor['s]*\s+(?:of\s+)?(?:Science|Arts|Engineering|Technology|Business)\s+(?:in\s+)?([\w\s&]+)?/gi,
    /Master['s]*\s+(?:of\s+)?(?:Science|Arts|Engineering|Technology|Business)\s+(?:in\s+)?([\w\s&]+)?/gi,
    /Associate['s]*\s+(?:Degree)?(?:in\s+)?([\w\s&]+)?/gi,
    /PhD\s+(?:in\s+)?([\w\s&]+)?/gi,
  ]

  degreePatterns.forEach((pattern) => {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      parsed.education.push(match[0])
    }
  })

  // Estimate years of experience by looking for date ranges
  const yearPattern = /(\d{4})\s*[-–]\s*(?:(\d{4})|present|current)/gi
  let totalMonths = 0

  const matches = text.matchAll(yearPattern)
  for (const match of matches) {
    const startYear = Number.parseInt(match[1])
    const endYear = match[2] ? Number.parseInt(match[2]) : new Date().getFullYear()
    totalMonths += (endYear - startYear) * 12
  }

  parsed.experience = Math.round(totalMonths / 12)

  return parsed
}
