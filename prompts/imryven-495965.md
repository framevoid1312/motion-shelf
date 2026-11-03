# Rebuild my Claude Code setup around this tree: 1. Look in…

**#236 by likes** · ♥ 290 · by [@imryven](https://x.com/imryven) · [Original post](https://x.com/imryven/status/2105719735438495965) · [Watch the video](https://video.twimg.com/amplify_video/2105718703442538496/vid/avc1/720x900/TfsPaYdDTYdrsW4o.mp4)

[![Rebuild my Claude Code setup around this tree: 1. Look in…](https://media.skillry.dev/opus-5-5/_prompts/imryven-495965/poster.4b4e7c2ce0.webp)](https://x.com/imryven/status/2105719735438495965)

## Prompt

```text
Rebuild my Claude Code setup around this tree:

1. Look in ~/.claude/agents and .claude/agents for subagents that already cover explorer, worker and researcher. Draft new ones only for roles that are missing. Set each to model: opus, effort: medium. If an existing subagent is pinned to a different model, list it, don't touch it.

2. Set the main session's effortLevel to high in ~/.claude/settings.json, and set advisorModel to fable.

3. Check for anything disabling the advisor: CLAUDE_CODE_DISABLE_ADVISOR_TOOL, DISABLE_TELEMETRY, any variable blocking feature-flag fetches, and CLAUDE_CODE_EFFORT_LEVEL, which overrides subagent effort. Report what you find. Change nothing yet.

4. Add one line to ~/.claude/CLAUDE.md: consult the advisor before a large plan, when an error repeats, and before marking a long task done.

Show every change as a diff first. Don't touch anything until I say go.
```

The prompt and video belong to @imryven; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)
