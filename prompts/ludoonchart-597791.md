# Market maker terminal dashboard with live BTC bars and fills

**#1172 by popularity** · ♥ 29 · 2,381 views · by [@ludoonchart](https://x.com/ludoonchart) · [Original post](https://x.com/ludoonchart/status/2119560044509597791) · [Watch the video](https://video.twimg.com/amplify_video/2119559246488498177/vid/avc1/1080x1614/PYTrLDxsGsHECaqx.mp4)

[![Market maker terminal dashboard with live BTC bars and fills](https://pbs.twimg.com/amplify_video_thumb/2119559246488498177/img/bCGli5cP-DJWX_qJ.jpg)](https://x.com/ludoonchart/status/2119560044509597791)

## Prompt

```text
here is the EXACT build from scratch:

1. Install Python 3.10+, Node 18+ and Claude Code. That's the only prerequisite.

2. Open Claude Code and paste: "Create a fresh venv and install hftbacktest from https://t.co/3LdDK9cI93 and perspective-python from https://t.co/YTfNQB2K8n. In a new folder run npm install for lightweight-charts from https://t.co/eSOuA1LUBg."

3. Paste: "Get the last 2 days of 1-minute BTC/USD bars from a public exchange dataset. Real bars only, no made-up candles."

4. Paste: "Write a market maker. Quote a bid and an ask around the last close at k x ATR, skew both quotes against inventory, cap inventory at 0.5 BTC, size 0.10 BTC. A quote fills only when price trades through it."

5. Paste: "Sweep k from 1 to 2.2 and skew from 0 to 1.6, 15 combos. Rank by Sharpe. Split the data into 4 windows and run the best combo on each one."

6. Paste: "Stream every fill into a perspective table: time, side, price, qty, edge, markout, inventory. Add a 10-minute bucket table with fills, buy/sell split and edge."

7. Paste: "Draw candles with lightweight-charts, our bid/ask corridor around them and a marker on every fill. Split P&L into spread edge and inventory P&L. Make the agent log fire on the same bar as the fill."

8. Remember: this is a bar-level simulation with no order book, fees are assumed zero, and the best combo was picked on the same data it's shown on. A real queue would fill you less. It's a screen, not proof.

9. Feed hftbacktest real L2 data, run walk-forward and paper trade it for weeks before you even think about live.

be one of the first to use this before everyone else does
```

The prompt and video belong to @ludoonchart; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)
