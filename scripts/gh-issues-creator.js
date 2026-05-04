#!/usr/bin/env node
import { execSync } from 'child_process'
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join, resolve } from 'path'

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const repoArg = args.find((arg) => !arg.startsWith('--'))
const ISSUES_FILE = resolve(process.cwd(), 'GITHUB_ISSUES.md')

const LABEL_COLORS = {
  critical: 'D93F0B',
  high: 'E4E669',
  medium: '0075CA',
  low: 'CFE2F3',
  bug: 'd73a4a',
  security: 'e4e669',
  infrastructure: 'bfd4f2',
  'error-handling': 'f9d0c4',
  performance: 'c5def5',
  testing: '0e8a16',
  'flaky-test': 'fbca04',
  'memory-leak': 'b60205',
  cache: 'bfd4f2',
  'data-quality': 'c2e0c6',
  quality: '0e8a16',
  images: 'fef2c0',
  'type-safety': 'd4c5f9',
  deployment: 'bfd4f2',
  logging: 'c5def5',
  observability: 'c5def5',
  caching: 'bfd4f2',
  'code-quality': 'e4e669',
  maintainability: 'e4e669',
  integration: '0e8a16',
  documentation: '0075ca',
  devex: 'c5def5',
  hardening: 'b60205',
  ci: 'e4e669',
  ui: 'fef2c0',
  currency: 'fef2c0',
  resilience: 'c5def5',
  ux: 'fef2c0',
  offline: 'c5def5',
  reliability: 'c5def5',
  api: '0075ca',
  analytics: 'fef2c0',
  feature: 'a2eeef',
  i18n: 'c5def5',
  navigation: 'c5def5',
  cart: 'fef2c0',
  'state-management': 'd4c5f9',
}

const readOriginRemoteUrl = () => {
  const gitConfigPath = resolve(process.cwd(), '.git', 'config')

  if (!existsSync(gitConfigPath)) {
    return null
  }

  const gitConfig = readFileSync(gitConfigPath, 'utf8')
  const originSectionMatch = gitConfig.match(
    /\[remote "origin"\]([\s\S]*?)(?:\n\[|$)/,
  )

  if (!originSectionMatch) {
    return null
  }

  const urlMatch = originSectionMatch[1].match(/url\s*=\s*(.+)/)
  return urlMatch?.[1]?.trim() ?? null
}

const detectRepo = () => {
  const remoteUrl = readOriginRemoteUrl()
  if (remoteUrl) {
    const remoteMatch = remoteUrl.match(/github\.com[:/](.+?)(?:\.git)?$/)
    if (remoteMatch) {
      return remoteMatch[1]
    }
  }

  try {
    return execSync('gh repo view --json nameWithOwner --jq .nameWithOwner', {
      stdio: 'pipe',
    })
      .toString()
      .trim()
  } catch {}

  return null
}

const REPO = repoArg ?? detectRepo()

if (!REPO) {
  console.error(
    'Usage: node scripts/gh-issues-creator.js [owner/repo] [--dry-run]',
  )
  console.error(
    'Tip: run it from inside a cloned GitHub repo or pass owner/repo explicitly.',
  )
  process.exit(1)
}

const readIssuesFile = () => {
  try {
    return readFileSync(ISSUES_FILE, 'utf8')
  } catch (error) {
    console.error(`Failed to read issues file: ${ISSUES_FILE}`)
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

const parseLabels = (labelsLine) => {
  return [...labelsLine.matchAll(/`([^`]+)`/g)].map((match) => match[1].trim())
}

const stripIssueHeading = (body) => {
  const lines = body.trim().split('\n')
  return lines.slice(1).join('\n').trim()
}

const parseIssueBlock = (block) => {
  const titleMatch = block.match(/\*\*Title:\*\*\s*(.+)/)
  const labelsMatch = block.match(/\*\*Labels:\*\*\s*(.+)/)

  if (!titleMatch || !labelsMatch) {
    return null
  }

  const title = titleMatch[1].trim()
  const labels = parseLabels(labelsMatch[1])

  const titleIndex = block.indexOf(titleMatch[0])
  const labelsIndex = block.indexOf(labelsMatch[0])
  const bodyStartIndex = labelsIndex + labelsMatch[0].length

  if (titleIndex === -1 || labelsIndex === -1 || bodyStartIndex < 0) {
    return null
  }

  const bodyWithoutHeading = stripIssueHeading(block)
  const bodyAfterLabels = bodyWithoutHeading.slice(
    bodyWithoutHeading.indexOf(labelsMatch[0]) + labelsMatch[0].length,
  )

  return {
    title,
    labels,
    body: bodyAfterLabels.trim(),
  }
}

const parseIssues = (content) => {
  const issueBlocks = content
    .split(/^### /m)
    .slice(1)
    .map((block) => `### ${block}`.trim())

  return issueBlocks
    .map(parseIssueBlock)
    .filter((issue) => issue !== null)
}

const createLabels = (issues) => {
  const uniqueLabels = [...new Set(issues.flatMap((issue) => issue.labels))]
  let labelsWorking = true

  console.log('Creating labels...')
  for (const labelName of uniqueLabels) {
    const color = LABEL_COLORS[labelName] ?? 'ededed'

    try {
      execSync(
        `gh label create "${labelName}" --color "${color}" --repo "${REPO}"`,
        { stdio: 'pipe' },
      )
      process.stdout.write('.')
    } catch (error) {
      const message =
        error instanceof Error && 'stderr' in error && error.stderr
          ? error.stderr.toString()
          : ''

      if (message.includes('already exists')) {
        process.stdout.write('-')
      } else if (message.includes('403')) {
        console.log(
          '\nNo permission to create labels. Issues will be created without labels.',
        )
        labelsWorking = false
        break
      } else {
        console.error(`\nFailed to create label "${labelName}": ${message.trim()}`)
      }
    }
  }

  if (labelsWorking) {
    console.log('\nLabels done.\n')
  }

  return labelsWorking
}

const createIssues = (issues, labelsWorking) => {
  if (DRY_RUN) {
    console.log(`Dry run for repo: ${REPO}`)
    console.log(`Parsed ${issues.length} issues from ${ISSUES_FILE}\n`)

    for (const issue of issues) {
      console.log(`- ${issue.title}`)
      console.log(`  labels: ${issue.labels.join(', ')}`)
    }

    console.log('\nNo issues were created.')
    return
  }

  console.log(`Creating ${issues.length} issues...\n`)

  let created = 0
  let failed = 0

  for (const issue of issues) {
    const tmpFile = join(tmpdir(), `gh-issue-${Date.now()}-${created}.md`)
    writeFileSync(tmpFile, issue.body, 'utf8')

    const labelsFlag = labelsWorking
      ? issue.labels.map((label) => `--label "${label}"`).join(' ')
      : ''

    try {
      const result = execSync(
        `gh issue create --title "${issue.title.replace(/"/g, '\\"')}" --body-file "${tmpFile}" ${labelsFlag} --repo "${REPO}"`,
        { stdio: 'pipe' },
      )
        .toString()
        .trim()

      console.log(`Created: ${issue.title}`)
      console.log(`  ${result}\n`)
      created++
    } catch (error) {
      const message =
        error instanceof Error && 'stderr' in error && error.stderr
          ? error.stderr.toString().trim()
          : String(error)

      console.error(`Failed: ${issue.title}`)
      console.error(`  ${message}\n`)
      failed++
    } finally {
      try {
        unlinkSync(tmpFile)
      } catch {}
    }
  }

  console.log(`Done. Created: ${created}, Failed: ${failed}`)
}

const issuesFileContent = readIssuesFile()
const issues = parseIssues(issuesFileContent)

if (issues.length === 0) {
  console.error(`No issues found in ${ISSUES_FILE}`)
  process.exit(1)
}

const labelsWorking = DRY_RUN ? false : createLabels(issues)
createIssues(issues, labelsWorking)
