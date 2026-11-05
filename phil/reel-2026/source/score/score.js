// REEL 2026 — score v4. Tone.js, rendered OFFLINE (Tone.Offline), never in real time.
// 150 BPM (beat 0.4 s, 16th 0.1 s). Every section runs its own groove from its own downbeat, so the
// music hard-cuts with the picture the way a reel edit does. Every picture event has a sound placed
// on its exact second (events come from the picture's own timing logic, see events.json).
window.renderScore = async (EV, seconds = 35) => {
  const T = Tone;
  const H = (n) => { n = Math.imul((n | 0) ^ 0x9e3779b9, 0x85ebca6b); n ^= n >>> 13; n = Math.imul(n, 0xc2b2ae35); n ^= n >>> 16; return (n >>> 0) / 4294967296; };
  const db = (x) => Math.pow(10, x / 20);
  const NOTE = (n) => T.Frequency(n).toFrequency();
  const grid = (o, a, b, step) => { const out = []; for (let k = Math.ceil((a - o) / step - 1e-6); o + k * step < b - 1e-6; k++) out.push([+(o + k * step).toFixed(4), k]); return out; };

  const buffer = await T.Offline(async () => {
    // ------------------------------------------------------------------ buses
    const limiter = new T.Limiter(-1.2).toDestination();
    const comp = new T.Compressor({threshold: -20, ratio: 2.6, attack: 0.006, release: 0.14, knee: 8}).connect(limiter);
    const eq = new T.EQ3({low: -4.5, mid: 0, high: 3.5, lowFrequency: 140, highFrequency: 4200}).connect(comp);
    const master = new T.Gain(0.8).connect(eq);
    const verb = new T.Reverb({decay: 2.2, preDelay: 0.01, wet: 1}); await verb.ready;
    const verbIn = new T.Filter(260, 'highpass'); verbIn.connect(verb); verb.connect(master);
    const hall = new T.Reverb({decay: 6.5, preDelay: 0.025, wet: 1}); await hall.ready;
    const hallIn = new T.Filter(180, 'highpass'); hallIn.connect(hall); hall.connect(master);
    const delay = new T.PingPongDelay({delayTime: 0.3, feedback: 0.34, wet: 1});           // dotted 8th @150
    const dlyIn = new T.Filter(700, 'highpass'); const dlyOut = new T.Filter(5600, 'lowpass');
    dlyIn.connect(delay); delay.connect(dlyOut); dlyOut.connect(master);
    const pump = new T.Gain(1).connect(master);            // music bus, ducked by every kick
    const drums = new T.Gain(1).connect(master);
    const fx = new T.Gain(1).connect(master);
    const route = (node, bus, {pan = 0, rev = 0, big = 0, dly = 0} = {}) => {
      const p = new T.Panner(Math.max(-1, Math.min(1, pan))); node.connect(p); p.connect(bus);
      if (rev) p.connect(new T.Gain(rev).connect(verbIn));
      if (big) p.connect(new T.Gain(big).connect(hallIn));
      if (dly) p.connect(new T.Gain(dly).connect(dlyIn));
      return p;
    };
    const crushCurve = (steps) => (x) => Math.round(x * steps) / steps;

    // ------------------------------------------------------------------ one-shot factories (a fresh voice per event)
    // pitched voice: oscillator with a pitch glide, through an envelope
    const tone = (t, o) => {
      const {f0, f1 = f0, glide = 0.05, type = 'sine', a = 0.001, d = 0.08, hold = 0, r = 0.04, vol = -12, pan = 0, rev = 0, big = 0, dly = 0, bus = fx, lp = 0, crush = 0} = o;
      const osc = new T.Oscillator({type, frequency: f0});
      const env = new T.AmplitudeEnvelope({attack: a, decay: d, sustain: hold ? 1 : 0, release: hold ? r : 0.01, decayCurve: 'exponential'});
      const g = new T.Gain(db(vol));
      const chain = [osc];
      if (lp) chain.push(new T.Filter(lp, 'lowpass'));
      if (crush) chain.push(new T.WaveShaper(crushCurve(crush), 2048));
      chain.push(env, g); T.connectSeries(...chain);
      route(g, bus, {pan, rev, big, dly});
      osc.frequency.setValueAtTime(f0, t);
      if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(f1, t + glide);
      const end = hold ? t + a + hold : t + a + d * 5;
      env.triggerAttack(t); env.triggerRelease(hold ? t + a + hold : t + a + d * 4);
      osc.start(t).stop(end + r + 0.05);
    };
    // noise voice: noise through a swept filter, through an envelope
    const noise = (t, o) => {
      const {type = 'white', ft = 'bandpass', f0 = 2000, f1 = f0, sweep = 0.1, Q = 0.8, a = 0.001, d = 0.1, hold = 0, r = 0.02, vol = -14, pan = 0, pan1 = null, rev = 0, big = 0, dly = 0, bus = fx, crush = 0, aCurve = 'linear'} = o;
      const n = new T.Noise(type);
      const f = new T.Filter({type: ft, frequency: f0, Q});
      const env = new T.AmplitudeEnvelope({attack: a, decay: d, sustain: hold ? 1 : 0, release: hold ? r : 0.01, decayCurve: 'exponential', attackCurve: aCurve});
      const g = new T.Gain(db(vol));
      const chain = [n, f];
      if (crush) chain.push(new T.Gain(5), new T.WaveShaper(crushCurve(crush), 2048), new T.Gain(0.3));
      chain.push(env, g); T.connectSeries(...chain);
      const p = route(g, bus, {pan, rev, big, dly});
      if (pan1 !== null) { p.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), t); p.pan.linearRampToValueAtTime(Math.max(-1, Math.min(1, pan1)), t + a + hold + d); }
      f.frequency.setValueAtTime(f0, t);
      if (f1 !== f0) f.frequency.exponentialRampToValueAtTime(f1, t + sweep);
      env.triggerAttack(t); env.triggerRelease(hold ? t + a + hold : t + a + d * 4);
      n.start(t).stop((hold ? t + a + hold : t + a + d * 5) + r + 0.05);
    };
    // riser: noise up-sweep + pitched saw up-glide, cut dead at t1 (the suck before an impact)
    const riser = (t0, t1, {vol = -14, f0 = 300, f1 = 7000, p0 = 110, p1 = 1400, tonal = true, pan = 0} = {}) => {
      noise(t0, {type: 'pink', ft: 'bandpass', f0, f1, sweep: t1 - t0, Q: 1.2, a: t1 - t0, hold: 0.0001, r: 0.012, vol, aCurve: 'exponential', rev: 0.25, pan});
      if (tonal) tone(t0, {f0: p0, f1: p1, glide: t1 - t0, type: 'sawtooth', a: t1 - t0, hold: 0.0001, r: 0.012, vol: vol - 9, lp: 3200, rev: 0.3});
    };
    // whoosh: band-passed noise that swells and passes
    const whoosh = (t, d, {f0 = 400, f1 = 4000, vol = -16, pan = -0.5, pan1 = 0.5, big = 0.2} = {}) =>
      noise(t, {type: 'pink', ft: 'bandpass', f0, f1, sweep: d, Q: 1.4, a: d * 0.6, d: d * 0.35, vol, pan, pan1, big, aCurve: 'exponential'});
    // clap: three fast noise slaps and a tail
    const clap = (t, vol = -15, pan = 0, rev = 0.3) => {
      const n = new T.Noise('white'); const f = new T.Filter({type: 'bandpass', frequency: 1350, Q: 0.9}); const g = new T.Gain(0);
      T.connectSeries(n, f, g); route(g, drums, {pan, rev});
      const pk = db(vol);
      g.gain.setValueAtTime(0, t);
      [0, 0.011, 0.022].forEach((o, k) => {
        g.gain.setValueAtTime(pk, t + o);
        g.gain.exponentialRampToValueAtTime(pk * (k < 2 ? 0.08 : 0.002), t + o + (k < 2 ? 0.0095 : 0.17));
      });
      g.gain.setValueAtTime(0, t + 0.2);
      n.start(t).stop(t + 0.22);
    };
    // impact: sub drop + transient + low noise bloom + air into the hall
    const impact = (t, s = 1, {pitch = 1, pan = 0} = {}) => {
      tone(t, {f0: 150 * pitch, f1: 34 * pitch, glide: 0.28, type: 'sine', d: 0.55 * s + 0.2, vol: -5 + 4 * Math.log10(s), bus: drums});
      noise(t, {type: 'white', ft: 'lowpass', f0: 11000, f1: 260, sweep: 0.45, Q: 0.4, d: 0.22 * s + 0.05, vol: -13 + 3 * Math.log10(s), big: 0.35 * s, pan});
      noise(t, {type: 'white', ft: 'highpass', f0: 5200, Q: 0.4, d: 0.5 * s, vol: -27, big: 0.5 * s, pan: -pan});
      tone(t, {f0: 2400, f1: 900, glide: 0.006, type: 'square', d: 0.004, vol: -24, lp: 6000, bus: drums});   // click
    };
    // glyph blip: square tick with a ping-pong tail (the decode letters, the cut hits)
    const blip = (t, f, {vol = -19, pan = 0, dly = 0.22, d = 0.05, type = 'square'} = {}) => {
      tone(t, {f0: f, type, d, vol, pan, dly, lp: 7000, rev: 0.12});
      noise(t, {ft: 'highpass', f0: 6000, d: 0.003, vol: vol + 2, pan});
    };
    const tick = (t, f, vol = -18, pan = 0, d = 0.012, dly = 0) => tone(t, {f0: f, type: 'sine', d, vol, pan, dly});
    const zip = (t, d, up, vol = -22, pan = 0) => tone(t, {f0: up ? 380 : 3400, f1: up ? 3400 : 420, glide: d, type: 'sawtooth', a: 0.004, d: d * 0.7, vol, pan, lp: 5200, rev: 0.15});
    const drop = (t, f, vol = -10, pan = 0) => {      // water drop: fast falling sine, splash, sub
      tone(t, {f0: f * 6.5, f1: f, glide: 0.065, type: 'sine', d: 0.16, vol, pan, rev: 0.25, big: 0.55, dly: 0.25});
      tone(t, {f0: 74, f1: 36, glide: 0.25, type: 'sine', d: 0.45, vol: vol + 1, bus: drums});
      noise(t + 0.006, {ft: 'lowpass', f0: 5200, f1: 500, sweep: 0.2, d: 0.12, vol: vol - 12, pan, big: 0.4});
    };
    const crushBurst = (t, d, vol = -16, pan = 0) => noise(t, {ft: 'lowpass', f0: 7000, f1: 300, sweep: d, Q: 0.7, d: d * 0.45, vol, pan, crush: 5, rev: 0.15});
    // dB per cut type, picked by a hash so a run never repeats the same sound twice in a row
    const cutHit = (t, k, seed, vol = -15) => {
      const r = H(k * 31 + seed * 977), pan = (H(k * 17 + seed) - 0.5) * 1.1;
      const kind = Math.floor(H(k * 7 + seed * 13) * 5);
      if (kind === 0) blip(t, [1760, 2093, 2349, 2637, 3136][Math.floor(r * 5)], {vol: vol - 1, pan, dly: 0.14, d: 0.025});
      else if (kind === 1) tone(t, {f0: 300 + r * 400, f1: 2400 + r * 1600, glide: 0.04, type: 'triangle', d: 0.05, vol: vol - 2, pan, rev: 0.12});
      else if (kind === 2) { tone(t, {f0: 520 + r * 300, f1: 110, glide: 0.04, type: 'sine', d: 0.07, vol: vol + 1, pan}); }
      else if (kind === 3) noise(t, {ft: 'bandpass', f0: 2600 + r * 3000, Q: 2.2, d: 0.018, vol: vol + 1, pan, rev: 0.1});
      else zip(t, 0.05, r > 0.5, vol - 3, pan);
    };

    // ------------------------------------------------------------------ shared instruments (the groove)
    const kick = new T.MembraneSynth({pitchDecay: 0.03, octaves: 5.6, oscillator: {type: 'sine'}, envelope: {attack: 0.001, decay: 0.34, sustain: 0, release: 0.04}});
    const kickSat = new T.Distortion(0.12); T.connectSeries(kick, kickSat); route(kickSat, drums); kick.volume.value = -4.5;
    const hat = new T.NoiseSynth({noise: {type: 'white'}, envelope: {attack: 0.0008, decay: 0.026, sustain: 0, release: 0.01}});
    const hatHP = new T.Filter(8200, 'highpass'); T.connectSeries(hat, hatHP); route(hatHP, drums, {pan: 0.18, rev: 0.05}); hat.volume.value = -19;
    const ohat = new T.NoiseSynth({noise: {type: 'white'}, envelope: {attack: 0.002, decay: 0.15, sustain: 0, release: 0.02}});
    const ohatHP = new T.Filter(7000, 'highpass'); T.connectSeries(ohat, ohatHP); route(ohatHP, drums, {pan: -0.15, rev: 0.12}); ohat.volume.value = -24.5;
    const bass = new T.MonoSynth({oscillator: {type: 'sawtooth'}, filter: {Q: 3, type: 'lowpass', rolloff: -24},
      envelope: {attack: 0.003, decay: 0.17, sustain: 0, release: 0.04}, filterEnvelope: {attack: 0.002, decay: 0.11, sustain: 0, release: 0.06, baseFrequency: 75, octaves: 3.3}});
    const bassSat = new T.Distortion(0.25); T.connectSeries(bass, bassSat); route(bassSat, pump); bass.volume.value = -14;
    const sub = new T.Synth({oscillator: {type: 'sine'}, envelope: {attack: 0.004, decay: 0.2, sustain: 0, release: 0.04}}); route(sub, pump); sub.volume.value = -14;
    const pad = new T.PolySynth(T.Synth, {maxPolyphony: 64, oscillator: {type: 'fatsawtooth', count: 3, spread: 22}, envelope: {attack: 0.5, decay: 0.6, sustain: 0.75, release: 1.8}});
    const padLP = new T.Filter({type: 'lowpass', frequency: 900, Q: 0.4}); const padCh = new T.Chorus(0.6, 3.5, 0.4).start();
    T.connectSeries(pad, padLP, padCh); route(padCh, pump, {rev: 0.45, big: 0.25}); pad.volume.value = -27;
    const bell = new T.PolySynth(T.FMSynth, {maxPolyphony: 32, harmonicity: 3.01, modulationIndex: 11, oscillator: {type: 'sine'},
      envelope: {attack: 0.002, decay: 2.2, sustain: 0, release: 1.4}, modulation: {type: 'sine'}, modulationEnvelope: {attack: 0.002, decay: 0.5, sustain: 0, release: 0.4}});
    route(bell, fx, {rev: 0.4, big: 0.35, dly: 0.2}); bell.volume.value = -22;
    const stab = new T.PolySynth(T.Synth, {maxPolyphony: 48, oscillator: {type: 'fatsquare', count: 2, spread: 14}, envelope: {attack: 0.003, decay: 0.28, sustain: 0, release: 0.15}});
    const stabLP = new T.Filter(2600, 'lowpass'); T.connectSeries(stab, stabLP); route(stabLP, fx, {rev: 0.35, dly: 0.18}); stab.volume.value = -21;

    // groove event lists, triggered in time order per instrument
    const K = [], HT = [], OH = [], BS = [], CL = [], SUB = [];
    const ROOTS = {A: 'A', F: 'F', C: 'C', G: 'G', E: 'E', D: 'D'};
    const groove = (o, a, b, root, {half = null, roll = false, clapOn = true, open = true, bassOn = true, hatVel = 1} = {}) => {
      for (const [t, k] of grid(o, a, b, 0.4)) {
        const isHalf = half && t >= half[0] && t < half[1];
        if (!isHalf || k % 2 === 0) K.push([t, isHalf ? 0.85 : 1]);
        if (clapOn && k % 2 === 1 && !isHalf) CL.push(t);
        if (open && t + 0.2 < b) OH.push([t + 0.2, 0.8]);
        if (bassOn && t + 0.2 < b) {
          const oct = k % 8 === 7 ? 3 : 2;
          BS.push([t + 0.2, `${root}${oct}`, 0.95]);
          if (roll) { if (t + 0.1 < b) BS.push([t + 0.1, `${root}2`, 0.5]); if (t + 0.3 < b) BS.push([t + 0.3, `${root}2`, 0.65]); }
        }
      }
      for (const [t, k] of grid(o, a, b, 0.1)) HT.push([t, hatVel * [0.42, 0.2, 0.85, 0.26][k % 4] * (0.85 + 0.3 * H(k * 3 + Math.round(o * 10)))]);
    };

    // ================================================================== 0 – 4.4  COUNT 1989 → 2026
    tone(0.0, {f0: 90, f1: 38, glide: 0.5, d: 0.6, vol: -12, bus: drums});
    whoosh(0.0, 0.45, {f0: 300, f1: 2400, vol: -20, pan: 0, pan1: 0});
    // drone under the count: a low fat saw whose filter opens with the race, cut dead before the slam
    {
      const o = new T.FatOscillator({type: 'sawtooth', frequency: NOTE('A1'), count: 3, spread: 18});
      const f = new T.Filter({type: 'lowpass', frequency: 140, Q: 1.5}); const g = new T.Gain(0);
      T.connectSeries(o, f, g); route(g, pump, {rev: 0.2});
      g.gain.setValueAtTime(0, 0.2); g.gain.linearRampToValueAtTime(db(-30), 1.2); g.gain.exponentialRampToValueAtTime(db(-15), 4.34); g.gain.linearRampToValueAtTime(0, 4.365);
      f.frequency.setValueAtTime(140, 0.4); f.frequency.exponentialRampToValueAtTime(2600, 4.36);
      o.start(0.2).stop(4.4);
    }
    // 37 year ticks: pitch climbs with the year; each carries a tiny low "tok" for weight
    EV.ticks.forEach((t, i) => {
      tick(t, 1250 * Math.pow(2, (i / 36) * 1.6), -21 + 4 * (i / 36), i % 2 ? 0.22 : -0.22, 0.011);
      tone(t, {f0: 260, f1: 110, glide: 0.025, d: 0.025, vol: -26 + 4 * (i / 36), bus: drums});
    });
    // decade wipes (2000 / 2010 / 2020): a rising whoosh and a glyph chord
    [10, 20, 30].forEach((i, k) => {
      const t = EV.ticks[i];
      whoosh(t - 0.02, 0.22, {f0: 600, f1: 6000, vol: -21, pan: -0.6, pan1: 0.6, big: 0.1});
      blip(t, [1319, 1568, 1760][k], {vol: -22, dly: 0.25, d: 0.08});
    });
    riser(0.5, 4.36, {vol: -16, f0: 250, f1: 8000, p0: 110, p1: 1760});

    // ================================================================== 4.4  SLAM → decode
    K.push([4.4, 1, 0.3, 0.55]);
    impact(4.4, 1.5);
    clap(4.4, -13);
    pad.triggerAttackRelease(['A2', 'E3', 'G3', 'B3', 'C4'], 1.9, 4.4, 0.9);
    bell.triggerAttackRelease(['A4', 'E5'], 1.2, 4.42, 0.55);
    // cursor block appears
    for (let i = 0; i < 4; i++) tick(4.7 + i * 0.05, 1800, -20, 0.1, 0.008);
    // mono scramble chatter in the tiny lines
    for (let k = 0; k < 26; k++) tick(4.75 + k / 26, 2600 + Math.floor(H(k * 11) * 2600), -27, (H(k * 5) - 0.5) * 1.2, 0.0035);
    // the four letters of REEL land (half-glyph → grey → white): a pentatonic glyph motif
    [4.96, 5.06, 5.19, 5.26].forEach((t, i) => {
      blip(t - 0.03, [659, 784, 880, 1047][i] * 2, {vol: -29, d: 0.02, dly: 0});            // the half-glyph pre-tick
      blip(t, [659, 784, 880, 1047][i] * 2, {vol: -17, pan: [-0.3, -0.1, 0.1, 0.3][i], dly: 0.24, d: 0.055});
    });
    zip(5.32, 0.13, true, -21, 0.15);           // cursor stretch
    tick(5.48, 900, -19, 0, 0.02);
    zip(5.5, 0.16, false, -23, -0.1);           // retract
    noise(5.6, {ft: 'bandpass', f0: 3000, Q: 3, d: 0.01, vol: -20});   // tracking snap
    // pre-roll into the montage: filtered kick pulse, hats swell, riser, suck
    {
      const pre = new T.MembraneSynth({pitchDecay: 0.03, octaves: 5, envelope: {attack: 0.001, decay: 0.25, sustain: 0}});
      const preLP = new T.Filter(320, 'lowpass'); T.connectSeries(pre, preLP); route(preLP, drums); pre.volume.value = -9;
      [5.4, 5.8, 6.2].forEach((t) => pre.triggerAttackRelease('G1', 0.2, t));
      for (const [t, k] of grid(5.8, 5.8, 6.55, 0.1)) HT.push([t, 0.18 + 0.5 * ((t - 5.8) / 0.75)]);
    }
    riser(6.05, 6.565, {vol: -17, f0: 500, f1: 9000, tonal: false});

    // ================================================================== 6.6 – 11.8  SEQUENCE A (micrographics, 4–8 frame shots)
    impact(6.6, 1.0);
    groove(6.6, 6.6, 11.6, 'A');
    pad.triggerAttackRelease(['A2', 'E3', 'G3', 'C4'], 4.8, 6.6, 0.6);
    EV.cutsA.forEach((t, k) => { if (t > 6.61) cutHit(t, k, 1); });
    [8.2, 9.8].forEach((t, k) => stab.triggerAttackRelease(k ? ['C4', 'E4', 'G4'] : ['A3', 'C4', 'E4'], 0.12, t, 0.8));
    whoosh(11.42, 0.38, {f0: 5000, f1: 300, vol: -17, pan: 0.4, pan1: -0.4, big: 0.2});   // the dive (zoom blur 11.7)

    // ================================================================== 11.8 – 14.8  3D POINT OCEAN
    impact(11.8, 1.2, {pitch: 0.9});
    tone(11.8, {f0: 1400, f1: 240, glide: 0.21, type: 'sine', d: 0.12, vol: -19, dly: 0.2});   // the lime core falls
    pad.triggerAttackRelease(['F2', 'C3', 'E3', 'G3', 'A3'], 2.7, 11.85, 0.85);
    [[12.0, 0, 95], [12.55, -560, 70], [12.95, 640, 70], [13.35, -200, 80]].forEach(([t, x, A], i) => {
      drop(t, [196, 233, 220, 175][i], -12 + (A - 70) / 12, x / 1400);
      // the ring travels out: points light up as it passes — tiny pentatonic pings, spreading in stereo
      for (let k = 0; k < 9; k++) {
        const tt = t + 0.06 + k * 0.045 + H(i * 40 + k) * 0.02;
        tick(tt, [1760, 2093, 2349, 2637, 3136, 3520][Math.floor(H(i * 9 + k) * 6)], -29 - k * 0.6, (x / 1400) + (k % 2 ? 1 : -1) * k * 0.08, 0.02, 0.35);
      }
    });
    // waves combine: a half-time sub heartbeat; camera tilts up and flies
    [13.4, 13.8, 14.2].forEach((t, k) => tone(t, {f0: 90, f1: 42, glide: 0.18, d: 0.32, vol: -11 + k * 1.5, bus: drums}));
    riser(13.35, 14.76, {vol: -14, f0: 220, f1: 9000, p0: 87, p1: 1400});
    whoosh(14.2, 0.58, {f0: 300, f1: 6500, vol: -13, pan: 0, pan1: 0, big: 0.25});            // the fly-through

    // ================================================================== 14.8 – 17.25  SEQUENCE B
    impact(14.8, 1.3);
    bell.triggerAttackRelease(['F4', 'C5'], 1.0, 14.82, 0.45);
    groove(14.8, 14.8, 17.25, 'F');
    pad.triggerAttackRelease(['F2', 'A2', 'C3', 'E3'], 2.3, 14.8, 0.6);
    EV.cutsB.forEach((t, k) => { if (t > 14.81 && t < 17.25) cutHit(t, k, 2); });

    // ================================================================== 17.25 – 19.65  POSTER (build, type, glitch out)
    impact(17.25, 0.6);
    for (let k = 0; k < 24; k++) tick(17.25 + k * 0.02, 2400 + Math.floor(H(k * 13 + 5) * 3200), -24, ((k % 5) - 2) * 0.28, 0.004);
    pad.triggerAttackRelease(['D3', 'F3', 'A3', 'C4', 'E4'], 2.2, 17.3, 0.8);
    padLP.frequency.setValueAtTime(900, 17.25); padLP.frequency.exponentialRampToValueAtTime(2600, 19.3); padLP.frequency.exponentialRampToValueAtTime(900, 19.7);
    for (const [t, k] of grid(17.2, 17.6, 19.6, 0.2)) HT.push([t, k % 2 ? 0.55 : 0.25]);       // a soft clock under the poster
    for (let k = 0; k < 38; k++) {                                                              // typing
      const t = 18.15 + (k * 1.4) / 38;
      noise(t, {ft: 'bandpass', f0: 2800 + H(k * 3) * 2200, Q: 2.5, d: 0.007, vol: -18 - H(k) * 4, pan: 0.25 + (H(k * 7) - 0.5) * 0.2});
      if (k % 3 === 0) tone(t, {f0: 1100 + H(k) * 300, d: 0.004, vol: -30, pan: 0.25});
    }
    {
      const arp = ['D4', 'F4', 'A4', 'C5', 'E5', 'A5', 'C5', 'A4'];
      for (const [t, k] of grid(17.6, 17.6, 19.55, 0.1)) {
        const p = (t - 17.6) / 1.95;
        tone(t, {f0: NOTE(arp[k % 8]) * (k >= 12 ? 2 : 1), type: 'triangle', d: 0.09, vol: -30 + 7 * p, pan: k % 2 ? 0.35 : -0.35, dly: 0.22, rev: 0.2, lp: 2000 + 6000 * p});
      }
      tone(17.3, {f0: NOTE('D1'), type: 'sine', a: 0.4, hold: 2.2, r: 0.05, vol: -23, bus: pump});
      const mk = new T.MembraneSynth({pitchDecay: 0.03, octaves: 5, envelope: {attack: 0.001, decay: 0.28, sustain: 0}});
      const mkLP = new T.Filter(220, 'lowpass'); T.connectSeries(mk, mkLP); route(mkLP, drums); mk.volume.value = -11;
      mkLP.frequency.setValueAtTime(220, 17.6); mkLP.frequency.exponentialRampToValueAtTime(3000, 19.5);
      for (const [t] of grid(17.2, 17.6, 19.6, 0.4)) mk.triggerAttackRelease('G1', 0.2, t);
    }
    zip(19.25, 0.08, true, -22, 0.3);
    riser(19.05, 19.62, {vol: -17, f0: 600, f1: 9000, tonal: false});
    for (let k = 0; k < 8; k++) {                                                               // glitch-out stutter
      const t = 19.65 + k * 0.025;
      crushBurst(t, 0.02, -15 - k, (H(k * 19) - 0.5) * 1.2);
      tone(t, {f0: 200 + H(k * 23) * 2400, type: 'square', d: 0.012, vol: -24, crush: 4, pan: (H(k) - 0.5)});
    }

    // ================================================================== 19.65 – 23.4  SEQUENCE C + B tail
    impact(19.65, 0.9);
    groove(19.65, 19.65, 21.25, 'C');
    groove(19.65, 21.25, 23.2, 'G');
    pad.triggerAttackRelease(['C3', 'E3', 'G3', 'B3'], 1.5, 19.7, 0.55);
    pad.triggerAttackRelease(['G2', 'D3', 'F3', 'A3'], 1.8, 21.25, 0.55);
    EV.cutsC.forEach((t, k) => { if (t > 19.86) cutHit(t, k, 3); });
    EV.cutsB.forEach((t, k) => { if (t >= 19.8 && t < 23.39) cutHit(t, k + 40, 4); });
    for (let k = 0; k < 4; k++) clap(23.0 + k * 0.1, -24 + k * 3, 0, 0.2);                        // snare run into the burst
    riser(22.85, 23.37, {vol: -16, f0: 400, f1: 9000, p0: 165, p1: 1320});

    // ================================================================== 23.4 – 26.55  BURST (four flips)
    groove(23.4, 23.4, 26.5, 'E', {roll: true});
    [23.4, 24.2, 25.0, 25.8].forEach((t, i) => {
      impact(t, 0.9 + i * 0.1, {pitch: 1 + i * 0.06, pan: [-0.3, 0.3, -0.2, 0.2][i]});
      whoosh(t - 0.12, 0.2, {f0: 900, f1: 7000, vol: -19, pan: i % 2 ? 0.6 : -0.6, pan1: i % 2 ? -0.6 : 0.6, big: 0.1});
      stab.triggerAttackRelease([['E3', 'B3', 'D4'], ['E3', 'B3', 'E4'], ['G3', 'B3', 'E4'], ['A3', 'B3', 'E4']][i], 0.14, t, 0.9);
    });
    pad.triggerAttackRelease(['E2', 'B2', 'D3', 'A3'], 3.0, 23.4, 0.6);
    for (let k = 0; k < 8; k++) tone(23.4 + k * 0.1, {f0: 500 + k * 60, f1: 1100 + k * 90, glide: 0.04, type: 'triangle', d: 0.04, vol: -24, pan: (k % 2 ? 0.4 : -0.4), dly: 0.15});
    EV.cutsB.forEach((t, k) => { if (t > 23.41 && t < 26.55 && ![24.2, 25.0, 25.8].some((x) => Math.abs(x - t) < 0.02)) cutHit(t, k + 80, 5); });
    // pixel dissolve: the image breaks into blocks — a crushed down-sweep, then the suck
    noise(26.55, {ft: 'lowpass', f0: 8000, f1: 260, sweep: 0.25, Q: 0.7, a: 0.004, hold: 0.22, r: 0.03, vol: -19, crush: 5, rev: 0.12});
    tone(26.55, {f0: 2600, f1: 70, glide: 0.25, type: 'square', a: 0.004, hold: 0.22, r: 0.03, vol: -25, crush: 3, lp: 5000});
    for (let k = 0; k < 8; k++) crushBurst(26.55 + k * 0.031, 0.025, -17 - k * 0.5, (H(k * 61) - 0.5) * 1.4);

    // ================================================================== 26.8 – 31.0  ASCII FIELD
    impact(26.8, 1.1);
    groove(26.8, 26.8, 30.9, 'A', {half: [28.4, 29.6]});
    pad.triggerAttackRelease(['A2', 'E3', 'G3', 'B3', 'C4'], 4.0, 26.85, 0.6);
    for (let k = 0; k < 41; k++) tick(26.8 + k * 0.1 + 0.05, [1760, 2093, 2349, 2637, 3136, 3520][Math.floor(H(k * 29) * 6)], -31, ((k % 7) - 3) * 0.2, 0.004, 0.2);   // data chatter
    {                                                                                           // the torus grind (half-time)
      const o = new T.Oscillator({type: 'sawtooth', frequency: NOTE('A1')}); const ws = new T.WaveShaper(crushCurve(3), 2048);
      const f = new T.Filter({type: 'bandpass', frequency: 300, Q: 2}); const g = new T.Gain(0);
      T.connectSeries(o, ws, f, g); route(g, pump, {rev: 0.2});
      g.gain.setValueAtTime(0, 28.4); g.gain.linearRampToValueAtTime(db(-24), 28.6); g.gain.linearRampToValueAtTime(db(-20), 29.5); g.gain.linearRampToValueAtTime(0, 29.6);
      f.frequency.setValueAtTime(300, 28.4); f.frequency.exponentialRampToValueAtTime(2400, 29.6);
      o.start(28.4).stop(29.65);
    }
    for (let k = 0; k < 30; k++) tick(29.5 + k * 0.025, 3600 + k * 40, -24 + k * 0.15, (k % 2 ? 0.3 : -0.3), 0.003);  // decode roll
    riser(30.5, 30.96, {vol: -15, f0: 500, f1: 9000, p0: 220, p1: 1760});

    // ================================================================== 31.0 – 32.6  RECAP (four hits)
    groove(31.0, 31.0, 32.56, 'A', {open: false, bassOn: false, clapOn: false, hatVel: 1.2});
    [31.0, 31.4, 31.8, 32.2].forEach((t, i) => {
      impact(t, 1.0, {pitch: [1, 1.19, 1.335, 1.5][i], pan: [-0.25, 0.25, -0.25, 0.25][i]});
      clap(t, -14, 0, 0.35);
      stab.triggerAttackRelease([['A3', 'C4', 'E4'], ['C4', 'E4', 'G4'], ['D4', 'F4', 'A4'], ['E4', 'G#4', 'B4']][i], 0.22, t, 1);
      SUB.push([t, ['A1', 'C2', 'D2', 'E2'][i], 1]);
    });
    riser(32.25, 32.57, {vol: -16, f0: 700, f1: 10000, tonal: false});

    // ================================================================== 32.6 – 35  END CARD
    K.push([32.6, 1, 0.3, 0.6]);
    impact(32.6, 1.6);
    pad.triggerAttackRelease(['A2', 'E3', 'G3', 'B3', 'C4', 'E4'], 1.9, 32.6, 0.9);
    bell.triggerAttackRelease(['A4', 'E5'], 1.4, 32.65, 0.6);
    bell.triggerAttackRelease(['B5'], 1.0, 33.1, 0.35);
    tone(32.6, {f0: NOTE('A1'), type: 'sine', a: 0.05, hold: 1.6, r: 0.6, vol: -16, bus: pump});
    for (let k = 0; k < 10; k++) tick(32.7 + k * 0.08, 1400 + k * 120, -24, 0, 0.006);       // the bar fills
    EV.endTicks.forEach((t, i) => tick(t, 1250 * Math.pow(2, (i / 36) * 1.6), -21 + (i > 30 ? 2 : 0), i % 2 ? 0.2 : -0.2, 0.006));  // the odometer rolls to 2026
    blip(34.16, 2637, {vol: -17, dly: 0.28, d: 0.07});                                        // 2026 locks
    tone(34.16, {f0: 120, f1: 50, glide: 0.1, d: 0.2, vol: -13, bus: drums});
    for (let k = 0; k < 18; k++) {                                                              // the card breaks into blocks
      const t = 34.3 + k * 0.033;
      noise(t, {ft: 'bandpass', f0: 6000 - k * 280, Q: 1.5, d: 0.02, vol: -19 - k * 0.9, pan: (H(k * 41) - 0.5) * 1.4, crush: 4});
    }

    // ------------------------------------------------------------------ trigger the groove in time order, with the kick ducking the music bus
    K.sort((a, b) => a[0] - b[0]).forEach(([t, v, depth = 0.42, len = 0.21]) => {
      kick.triggerAttackRelease('G1', 0.25, t, v);
      pump.gain.setValueAtTime(depth, t); pump.gain.linearRampToValueAtTime(1, t + len);
    });
    const uniq = (arr) => { const s = new Set(); return arr.sort((a, b) => a[0] - b[0]).filter((e) => { const key = e[0].toFixed(4); if (s.has(key)) return false; s.add(key); return true; }); };
    uniq(HT).forEach(([t, v]) => hat.triggerAttackRelease(0.02, t, Math.min(1, v)));
    uniq(OH).forEach(([t, v]) => ohat.triggerAttackRelease(0.1, t, v));
    uniq(BS).forEach(([t, n, v]) => { bass.triggerAttackRelease(n, 0.12, t, v); if (v > 0.9) SUB.push([t, n.replace(/\d/, '1'), 0.9]); });
    uniq(SUB).forEach(([t, n, v]) => sub.triggerAttackRelease(n, v === 1 ? 0.3 : 0.12, t, v));
    [...new Set(CL)].sort((a, b) => a - b).forEach((t) => clap(t, -16, 0.05, 0.25));

    // master fade on the last frames
    master.gain.setValueAtTime(0.8, 34.75); master.gain.linearRampToValueAtTime(0, 35.0);
  }, seconds, 2, 48000);

  // ------------------------------------------------------------------ 32-bit float WAV → base64
  const ch = [buffer.getChannelData(0), buffer.getChannelData(1)];
  const n = ch[0].length, bytes = 44 + n * 8, ab = new ArrayBuffer(bytes), dv = new DataView(ab);
  const w = (o, s) => [...s].forEach((c, i) => dv.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); dv.setUint32(4, bytes - 8, true); w(8, 'WAVE'); w(12, 'fmt '); dv.setUint32(16, 16, true);
  dv.setUint16(20, 3, true); dv.setUint16(22, 2, true); dv.setUint32(24, 48000, true); dv.setUint32(28, 48000 * 8, true);
  dv.setUint16(32, 8, true); dv.setUint16(34, 32, true); w(36, 'data'); dv.setUint32(40, n * 8, true);
  let off = 44, peak = 0;
  for (let i = 0; i < n; i++) for (let c = 0; c < 2; c++) { const v = ch[c][i]; peak = Math.max(peak, Math.abs(v)); dv.setFloat32(off, v, true); off += 4; }
  const u8 = new Uint8Array(ab); let bin = '';
  for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  return {b64: btoa(bin), peak, n};
};
