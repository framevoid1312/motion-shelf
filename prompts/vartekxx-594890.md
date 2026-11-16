# Cross-platform shared clipboard app demo with QR pairing and

**#1124 by popularity** · ♥ 35 · 2,639 views · by [@vartekxx](https://x.com/vartekxx) · [Original post](https://x.com/vartekxx/status/2117032140009594890) · [Watch the video](https://video.twimg.com/amplify_video/2117027586467311616/vid/avc1/1080x1920/RPYHqcg0OjcTacXT.mp4)

[![Cross-platform shared clipboard app demo with QR pairing and](https://pbs.twimg.com/amplify_video_thumb/2117027586467311616/img/TE3PeupVgL8wytgZ.jpg)](https://x.com/vartekxx/status/2117032140009594890)

## Prompt

```text
You're building "ClipShare": a free, open-source app that gives my Mac and my Windows PC one shared clipboard over my home Wi-Fi, with my iPhone joining from Safari.

Copy on one computer, paste on the other. No clicks in between. No cloud, no account, nothing to install on the phone. Start in this empty folder. Use Opus 5.5.

DESIGN BEFORE CODE

1. Don't write a single line of code yet. First, mock up 3 distinct visual directions for the app's web page as HTML: light theme, calm, premium, built around the idea of "selecting text". I'll choose one.
2. Then iterate on the chosen one until it feels like Apple shipped it: the text caret is the logo, a yellow highlighter sweep runs across every copied piece of text, a live "device rail" shows connected devices with a little clip travelling between them, soft ambient light drifting in the background, smooth FLIP animations when history updates. Respect reduced motion.

WHAT IT ACTUALLY HAS TO DO (zero fake data, ever)

- One Python file, standard library only, Python 3.8+. It runs a small local server on one computer and serves the web page.
- Watch the system clipboard: Windows through raw Win32 calls (ctypes), Mac through pbcopy/pbpaste. Text copied here appears on every other device within a second.
- Text arriving from another device goes straight into this computer's clipboard, so I just press Ctrl+V or ⌘V.
- The second computer runs the same file in "connect" mode and syncs both ways. No ping-pong loops, and copying the same text twice still syncs.
- iPhone: scan a QR code on the page, it opens in Safari. Send text, photos and files both ways (up to 2 GB, streamed, byte-for-byte). Paste a screenshot or drop a file on the page on a computer.
- iOS doesn't let apps read the clipboard in the background, so build and sign two iOS Shortcuts, "To Computer" and "From Computer", meant for Back Tap. Generic files signed with `shortcuts sign`; the address is asked once on import.
- Launchers: one double-click file per OS (ClipShare.bat, ClipShare.command) that opens a menu: 1 "Start ClipShare here", 2 "Connect to my other computer".

PAIRING (the part everyone gets wrong)

- I can't "copy the address and paste it on the second computer": the clipboards aren't linked yet. So the second computer must find the first one on the network by itself (UDP broadcast) and ask for a 6-digit pairing code shown on the first one.
- Read the real broadcast address from the OS (ifconfig / ip / ipconfig, including non-English ipconfig output). Subnets aren't always /24, and macOS blocks 255.255.255.255. Fall back to knocking on every address in my /24.
- Remember the pairing: next time "2" reconnects with no code.
- Only one ClipShare per computer. A second copy would show its own code while the network keeps talking to the first, so refuse to start and say why.

SECURITY + PRIVACY RULES

- Everything stays on my network. Nothing goes through a server on the internet.
- A secret k
```

The prompt and video belong to @vartekxx; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)
