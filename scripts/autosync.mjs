import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const runGit = (...args) => execFileSync('git', args, {
  cwd: repoRoot,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
}).trim()

function syncCommittedMain() {
  try {
    const branch = runGit('branch', '--show-current')
    if (branch !== 'main') {
      console.log(`[autosync] Skipping: current branch is "${branch || '(detached)'}", expected "main".`)
      return
    }

    if (!runGit('remote')) {
      console.log('[autosync] Skipping: no Git remote is configured.')
      return
    }
    runGit('remote', 'get-url', 'origin')
    runGit('fetch', 'origin', 'main')

    const [behindText, aheadText] = runGit('rev-list', '--left-right', '--count', 'origin/main...main').split(/\s+/)
    const behind = Number(behindText)
    const ahead = Number(aheadText)
    if (!Number.isFinite(behind) || !Number.isFinite(ahead)) {
      throw new Error('Could not parse the local/remote commit counts.')
    }
    if (behind > 0) {
      console.warn(`[autosync] Not pushing: origin/main has ${behind} commit(s) missing locally. Reconcile the branch manually.`)
      return
    }
    if (ahead === 0) {
      console.log('[autosync] main is up to date.')
      return
    }

    runGit('push', 'origin', 'main')
    console.log(`[autosync] Pushed ${ahead} committed change(s) to origin/main.`)
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    console.warn(`[autosync] Sync warning; will retry at the next scheduled interval. ${detail}`)
  }
}

syncCommittedMain()
