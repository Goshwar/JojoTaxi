# GitHub Issues & Milestone Tracking Guide for AI Dev Agents

This guide defines the required discipline, programmatic workflows, and rules for tracking progress, managing tasks, and keeping milestones updated on GitHub. Every AI dev agent starting a session on this project MUST read, understand, and strictly follow this protocol.

---

## 1. Repository Information
Always use these defaults when calling GitHub MCP tools:
- **Owner:** `Goshwar`
- **Repo:** `JojoTaxi`

**Project:** FUNtastic Taxi & Tours — a taxi/airport transfer booking website for St. Lucia (React 18 + TypeScript, Vite, Tailwind CSS, Supabase). See `CLAUDE.md` for architecture and conventions.

---

## 2. Core Principles
1. **No Untracked Work:** Every task (feature development, bug fix, refactoring, styling, or documentation update) must have a corresponding GitHub Issue.
2. **Milestone Alignment:** All issues must be mapped to their active milestone to ensure correct progress tracking toward project goals.
3. **Proactive Updates:** The agent is responsible for programmatically updating issue states, adding comments on progress, and reporting on remaining milestone tasks. Do not wait for the user to prompt you to do this.

---

## 3. Step-by-Step Workflow

### Phase 1: Session Start & Initialization
Before writing any code or executing tasks, complete the following steps:
1. **Identify Yourself:** Call the `get_me` tool to retrieve your current GitHub username.
2. **Search for Existing Issues:** Use `search_issues` to find if the user's request has an existing issue.
   - *Example query:* `repo:Goshwar/JojoTaxi state:open [keywords]`
3. **Retrieve or Create the Issue:**
   - **If the issue exists:** Read the details using `issue_read` (specifying the `issue_number`).
   - **If the issue does NOT exist:** Create a new issue using `issue_write` with `method: "create"`. Use the templates in Section 5.
4. **Assign and Milestone the Issue:**
   - Ensure the issue is assigned to your username (obtained from `get_me`).
   - Associate the issue with the current active milestone. If you do not know the milestone number, ask the user or query issues in the repository to find the active milestone number.

### Phase 2: Execution & Progress Tracking
As you work on the task:
1. **Document Mid-way Progress:** For multi-step tasks or when facing technical choices/blockers, call `add_issue_comment` to document:
   - What has been accomplished so far.
   - Architectural or design decisions made.
   - Blocking issues or questions for the user.
2. **Commit References:** In any git commits you make, reference the issue number in the format `issue #<number>` or `#<number>`.

### Phase 3: Verification & Closure
Once the task is complete:
1. **Verify Code Changes:** Run `npm run build` and `npm run lint` to ensure the code is correct and error-free. (No test suite is configured for this project; use the dev server `npm run dev` for manual verification when needed.)
2. **Post Verification Evidence:** Call `add_issue_comment` with proof of verification (e.g., build success confirmation, lint output, or visual descriptions).
3. **Close the Issue:**
   - If a Pull Request is being created, link the issue by writing `Closes #<issue_number>` in the PR body.
   - If no PR is needed (direct commits), close the issue using `issue_write` with `method: "update"`, `state: "closed"`, and `state_reason: "completed"`.
4. **Milestone Status Summary:** Provide a brief summary of the remaining open issues under the active milestone to give the user visibility on outstanding tasks.

---

## 4. GitHub MCP Tool Reference
Maximize efficiency by using the correct tools:
- **`get_me`**: Always call first to retrieve the agent's GitHub username.
- **`list_issues`**: Use to list issues for broad, simple retrieval and pagination.
- **`search_issues`**: Use for targeted queries with specific criteria (e.g. `state:open milestone:"Milestone 1"`).
- **`issue_read`**: Use to read the full body, labels, assignees, and milestone of a specific issue.
- **`issue_write`**:
  - For creation: `method: "create"`, `title`, `body`, `assignees`, `labels`, `milestone`.
  - For updating/closing: `method: "update"`, `issue_number`, `state: "closed"`, `state_reason: "completed"`.
- **`add_issue_comment`**: Use to document status updates, blocker details, and validation logs.
- **`create_pull_request`**: Link issues using keywords like `Closes #<issue_number>` in the description.

---

## 5. Issue Body Templates

### Feature / Task Template
```markdown
## Goal
[Clear statement of what needs to be achieved]

## Context / Acceptance Criteria
- [ ] Requirement 1
- [ ] Requirement 2

## Proposed Changes
- [ ] Component/file modifications
- [ ] Configuration changes
```

### Bug Template
```markdown
## Bug Description
[Clear description of the bug and where it occurs]

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error '...'

## Expected Behavior
[Clear description of what should happen]

## Actual Behavior / Error Logs
[Paste error messages, logs, or stack traces]
```
