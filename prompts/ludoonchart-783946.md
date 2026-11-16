# AI trading setup that scans market data and charts long and short

**#288 by popularity** · ♥ 361 · 47,853 views · by [@ludoonchart](https://x.com/ludoonchart) · [Original post](https://x.com/ludoonchart/status/2119181960794783946) · [Watch the video](https://video.twimg.com/amplify_video/2119181153353523200/vid/avc1/1080x1602/5GOf4JEdQzqPS3aD.mp4)

[![AI trading setup that scans market data and charts long and short](https://pbs.twimg.com/amplify_video_thumb/2119181153353523200/img/tXqqF1_GY4HfVzev.jpg)](https://x.com/ludoonchart/status/2119181960794783946)

## Prompt

```text
Create a fresh venv and install csp from https://t.co/itMmEMTdE5, gs-quant from https://t.co/7uvfWN54k1 and ArcticDB from https://t.co/B1Wm7axX5M."

3. Paste: "Get the last 30 days of 1-minute bars for any asset from a public exchange dataset (i used BTC/USD), resample to 15m and store them in a local ArcticDB library."

4. Paste: "Read the bars back from ArcticDB. Compute EMA, Bollinger Bands, RSI and a volume profile with gs-quant's timeseries functions."

5. Paste: "Use csp to replay the bars as a live stream. Write an EMA cross strategy that goes long and short, with 2 bps fees."

6. Paste: "Sweep fast 4-24 and slow 12-96, 212 combos. Rank by Sharpe. Split the 30 days into 4 windows and compute each window's equity curve. Tell me which combos are a plateau and which are a spike."

7. Paste: "Draw every long and short on the chart at the exact bar, and make the agent log fire on the same bar.
```

The prompt and video belong to @ludoonchart; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)
