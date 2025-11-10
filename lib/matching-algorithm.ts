export interface MatchResult {
  matchScore: number
  matchedSkills: string[]
  missingSkills: string[]
}

export function calculateMatchScore(jobSkills: string[], userSkills: string[]): MatchResult {
  const normalizeSkill = (skill: string) => skill.toLowerCase().trim()

  const normalizedJobSkills = jobSkills.map(normalizeSkill)
  const normalizedUserSkills = userSkills.map(normalizeSkill)

  const matchedSkills = normalizedJobSkills.filter((skill) =>
    normalizedUserSkills.some((userSkill) => userSkill.includes(skill) || skill.includes(userSkill)),
  )

  const missingSkills = normalizedJobSkills.filter((skill) => !matchedSkills.includes(skill))

  const matchScore =
    normalizedJobSkills.length > 0 ? Math.round((matchedSkills.length / normalizedJobSkills.length) * 100) : 0

  return {
    matchScore,
    matchedSkills,
    missingSkills,
  }
}

export function rankApplications(
  applications: Array<{
    skills: string[]
    experience: number
    jobSkills: string[]
    requiredExperience: number
    location?: string
    preferredJobType?: string
  }>,
) {
  return applications
    .map((app) => {
      const skillMatch = calculateMatchScore(app.jobSkills, app.skills)
      const experienceMatch = Math.min((app.experience / Math.max(app.requiredExperience, 1)) * 100, 100)

      const locationScore = app.location && app.location.toLowerCase().includes(app.location.toLowerCase()) ? 100 : 50

      const jobTypeScore = app.preferredJobType && app.preferredJobType === app.preferredJobType ? 100 : 75

      const totalScore = skillMatch.matchScore * 0.6 + experienceMatch * 0.2 + locationScore * 0.1 + jobTypeScore * 0.1

      return {
        ...app,
        matchScore: Math.round(totalScore),
        skillMatch: skillMatch.matchScore,
        experienceMatch: Math.round(experienceMatch),
        locationMatch: locationScore,
        jobTypeMatch: jobTypeScore,
      }
    })
    .sort((a, b) => b.matchScore - a.matchScore)
}

export function calculateAdvancedScore(
  jobSkills: string[],
  userSkills: string[],
  userExperience: number,
  requiredExperience: number,
  userLocation?: string,
  jobLocation?: string,
  jobType?: string,
  userPreferredJobType?: string,
): number {
  // Skill match (60% weight)
  const skillMatch = calculateMatchScore(jobSkills, userSkills)
  const skillScore = skillMatch.matchScore

  // Experience match (20% weight)
  const experienceScore = Math.min((userExperience / Math.max(requiredExperience, 1)) * 100, 100)

  // Location match (10% weight) - bonus if matching
  const locationScore =
    userLocation && jobLocation && userLocation.toLowerCase().includes(jobLocation.toLowerCase()) ? 100 : 50

  // Job type preference match (10% weight) - bonus if matching
  const jobTypeScore = jobType && userPreferredJobType && jobType === userPreferredJobType ? 100 : 75

  const totalScore = skillScore * 0.6 + experienceScore * 0.2 + locationScore * 0.1 + jobTypeScore * 0.1

  return Math.round(totalScore)
}
