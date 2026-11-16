# Workflow simulation comparing bare prompt versus bug-triage harness

**#1282 by popularity** · ♥ 30 · 1,008 views · by [@zuvexxx](https://x.com/zuvexxx) · [Original post](https://x.com/zuvexxx/status/2118016801011343705) · [Watch the video](https://video.twimg.com/amplify_video/2118016613844725760/vid/avc1/1080x1350/U27x3qNo1exj6h5x.mp4)

[![Workflow simulation comparing bare prompt versus bug-triage harness](https://pbs.twimg.com/media/HWS043bWoAA_Q5s.jpg)](https://x.com/zuvexxx/status/2118016801011343705)

## Prompt

```text
Make a workflow called bug-triage.
Phase 1, in parallel: one agent per open issue labeled bug. Read the issue, trace it to a root cause in this repo, cite the files and lines. Effort medium.
Phase 2, in parallel: for each root cause, an Opus agent tries to refute it by writing a failing test next to the cited file, in an isolated worktree. If it can't reproduce the bug, mark it not confirmed. Effort high.
End with a report of confirmed bugs only: issue, root cause, path to the failing test.
Save it so I can rerun it as /bug-triage.
```

The prompt and video belong to @zuvexxx; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)
