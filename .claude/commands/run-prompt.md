---
description: Run a prompt from the wepin worktree
argument: <number> - e.g., "1", "2", "3"
---

# Run Prompt: $ARGUMENTS

Parse the argument to get `{number}`.

## Step 1: Read Prompt

```bash
cat .claude/prompts/{number}.md
```

## Step 2: Execute

1. Load skills from "Required Skills" section
2. Execute the steps in the prompt
3. Verify checklist items

## Step 3: Delete on Success

```bash
rm .claude/prompts/{number}.md
```

Report: "Completed and deleted: {number}.md"
