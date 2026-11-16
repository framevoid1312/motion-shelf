# Printable adversarial T-shirt pattern with webcam detector demo

**#1031 by popularity** · ♥ 61 · 1,773 views · by [@coolerwave](https://x.com/coolerwave) · [Original post](https://x.com/coolerwave/status/2116239351554162926) · [Watch the video](https://video.twimg.com/amplify_video/2116239116182446080/vid/avc1/1920x1080/QvGidzPisdXiwGA5.mp4)

[![Printable adversarial T-shirt pattern with webcam detector demo](https://pbs.twimg.com/amplify_video_thumb/2116239116182446080/img/60ka0Ihrz_94lj2U.jpg)](https://x.com/coolerwave/status/2116239351554162926)

## Prompt

```text
I want to reproduce published adversarial clothing research (Thys et al. 2019 "Fooling automated surveillance cameras", Wu et al. "Making an Invisibility Cloak") on my own PC and webcam, to test how robust open-source person detectors are.

Goal: generate a printable pattern that lowers the "person" confidence of an open-source detector when I hold it in front of my torso or wear it on a shirt.

step 1 → set up Python + PyTorch + Ultralytics. Target: a small current YOLO, person class only. Use my GPU if available and verify it works first. Measure the clean detection rate on test images with no patch.

step 2 → data: a COCO person subset (a few thousand images) or INRIA Person, with a held-out test split I never train on. Patch: a learnable 300x300 RGB tensor from random noise. Loss = max "person" confidence on the patched boxes (use the raw model output before NMS so gradients flow) + total variation. Train with Adam, save the patch every epoch, log mean person confidence: no patch vs random-noise patch vs my patch. If mine isn't clearly better than random, say so.

step 3 → robustness: paste the patch on each person's torso with random scale, rotation ±20°, perspective, brightness/contrast, blur, noise and wrinkle-like distortion.

step 4 → printability: generate a color chart for me to print and photograph, build the palette from that photo, add a non-printability score to the loss.

step 5 → evaluate on the held-out split: % of patched persons NOT detected at conf 0.25, vs the clean rate. Then test transfer on a second detector (e.g. RT-DETR) and report it honestly.

step 6 → export a print-ready PDF (A3, 300 dpi) and a tiled T-shirt version.

step 7 → live demo: webcam + detector, person boxes with confidence, live confidence graph, FPS, dashboard overlay. Record to mp4.
```

The prompt and video belong to @coolerwave; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)
