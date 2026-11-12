// LOCKUP IN MOTION — score + SFX, 120 BPM, 20.0 s, rendered OFFLINE with Tone.js.
// Every event is scheduled at an absolute second taken from the film's edit list
// (src/BrutalistReel.tsx), so hits land on the cuts at any frame rate.
window.renderScore = async (seconds) => {
  const S = 0.125; // one 1/16 note at 120 BPM
  const BAR = 2.0;
  // deterministic PRNG so the composition (not the noise grain) is identical every render
  let seed = 1312;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  const buffer = await Tone.Offline(async () => {
    /* ── buses ─────────────────────────────────────────────── */
    const master = new Tone.Gain(0.9);
    const glue = new Tone.Compressor({threshold: -18, ratio: 3, attack: 0.008, release: 0.12});
    const limit = new Tone.Limiter(-1.5);
    master.chain(glue, limit);
    limit.toDestination();
    const verb = new Tone.Reverb({decay: 2.6, preDelay: 0.01, wet: 1});
    await verb.ready;
    const verbIn = new Tone.Gain(1).connect(verb);
    verb.connect(master);
    const send = (node, amt) => node.connect(new Tone.Gain(amt).connect(verbIn));

    /* ── instruments ───────────────────────────────────────── */
    const kickDrive = new Tone.Distortion(0.25).connect(master);
    const kick = new Tone.MembraneSynth({pitchDecay: 0.028, octaves: 7, oscillator: {type: 'sine'}, envelope: {attack: 0.001, decay: 0.42, sustain: 0, release: 0.05}}).connect(kickDrive);
    kick.volume.value = -5;

    const clapBp = new Tone.Filter({type: 'bandpass', frequency: 1700, Q: 0.9}).connect(master);
    send(clapBp, 0.35);
    const clap = new Tone.NoiseSynth({noise: {type: 'white'}, envelope: {attack: 0.001, decay: 0.11, sustain: 0}}).connect(clapBp);
    clap.volume.value = -9;

    const hatPan = new Tone.Panner(0).connect(master);
    const hatHp = new Tone.Filter({type: 'highpass', frequency: 7800}).connect(hatPan);
    const hat = new Tone.NoiseSynth({noise: {type: 'white'}, envelope: {attack: 0.001, decay: 0.028, sustain: 0}}).connect(hatHp);
    hat.volume.value = -17;
    const ohat = new Tone.NoiseSynth({noise: {type: 'white'}, envelope: {attack: 0.002, decay: 0.16, sustain: 0}}).connect(hatHp);
    ohat.volume.value = -24;

    const bassDrive = new Tone.Distortion(0.45).connect(master);
    const bass = new Tone.MonoSynth({
      oscillator: {type: 'square'},
      filter: {type: 'lowpass', Q: 7, rolloff: -24},
      envelope: {attack: 0.002, decay: 0.16, sustain: 0.15, release: 0.04},
      filterEnvelope: {attack: 0.001, decay: 0.11, sustain: 0.08, baseFrequency: 85, octaves: 3.6},
    }).connect(bassDrive);
    bass.volume.value = -15;

    const glitchPan = new Tone.Panner(0).connect(master);
    const crush = new Tone.BitCrusher(4).connect(glitchPan);
    send(crush, 0.12);
    const glitch = new Tone.FMSynth({
      harmonicity: 3.01, modulationIndex: 22,
      envelope: {attack: 0.001, decay: 0.045, sustain: 0, release: 0.01},
      modulationEnvelope: {attack: 0.001, decay: 0.03, sustain: 0, release: 0.01},
    }).connect(crush);
    glitch.volume.value = -12;

    const tickHp = new Tone.Filter({type: 'highpass', frequency: 1800}).connect(master);
    const tick = new Tone.Synth({oscillator: {type: 'square'}, envelope: {attack: 0.001, decay: 0.014, sustain: 0, release: 0.005}}).connect(tickHp);
    tick.volume.value = -15;
    const pop = new Tone.Synth({oscillator: {type: 'sine'}, envelope: {attack: 0.001, decay: 0.05, sustain: 0, release: 0.01}}).connect(tickHp);
    pop.volume.value = -11;
    send(pop, 0.25);

    const boom = new Tone.MembraneSynth({pitchDecay: 0.09, octaves: 5, envelope: {attack: 0.001, decay: 1.3, sustain: 0, release: 0.4}}).connect(master);
    boom.volume.value = -4;
    send(boom, 0.25);
    const burstLp = new Tone.Filter({type: 'lowpass', frequency: 2500}).connect(master);
    send(burstLp, 0.5);
    const burst = new Tone.NoiseSynth({noise: {type: 'brown'}, envelope: {attack: 0.001, decay: 0.5, sustain: 0}}).connect(burstLp);
    burst.volume.value = -10;

    const crashHp = new Tone.Filter({type: 'highpass', frequency: 3000}).connect(master);
    send(crashHp, 0.4);
    const crash = new Tone.MetalSynth({envelope: {attack: 0.001, decay: 1.4, release: 0.3}, harmonicity: 5.1, modulationIndex: 32, resonance: 4200, octaves: 1.5}).connect(crashHp);
    crash.volume.value = -22;

    const riserF = new Tone.Filter({type: 'bandpass', frequency: 300, Q: 1.4}).connect(master);
    send(riserF, 0.5);
    const riser = new Tone.NoiseSynth({noise: {type: 'pink'}, envelope: {attack: 0.5, decay: 0.02, sustain: 1, release: 0.03}}).connect(riserF);
    riser.volume.value = -10;

    const padLp = new Tone.Filter({type: 'lowpass', frequency: 700, Q: 0.5}).connect(master);
    send(padLp, 0.6);
    const pad = new Tone.PolySynth(Tone.Synth, {oscillator: {type: 'fatsawtooth', count: 3, spread: 28}, envelope: {attack: 0.9, decay: 0.4, sustain: 0.8, release: 1.6}}).connect(padLp);
    pad.volume.value = -23;

    const tapeGain = new Tone.Gain(0).connect(master);
    const tape = new Tone.Oscillator({type: 'sawtooth', frequency: 110}).connect(new Tone.Filter(900, 'lowpass').connect(tapeGain));

    /* ── event queue: mono synths need strictly increasing start times, so every
          trigger is queued, sorted, nudged apart by 0.5 ms if needed, then fired ── */
    const queue = [];
    const NOISE = new Set([clap, hat, ohat, burst, riser]); // (duration, time, velocity)
    [kick, clap, hat, ohat, bass, glitch, tick, pop, boom, burst, crash, riser, pad].forEach((inst) => {
      const orig = inst.triggerAttackRelease.bind(inst);
      const ti = NOISE.has(inst) ? 1 : 2;
      inst.triggerAttackRelease = (...args) => { queue.push({inst, orig, args, ti, t: args[ti]}); return inst; };
    });
    const flush = () => {
      queue.sort((x, y) => x.t - y.t);
      const last = new Map();
      for (const e of queue) {
        let t = e.t;
        if (e.inst !== pad && last.has(e.inst) && t <= last.get(e.inst) + 1e-4) t = last.get(e.inst) + 5e-4;
        last.set(e.inst, t);
        e.args[e.ti] = t;
        e.orig(...e.args);
      }
    };

    /* ── helpers ───────────────────────────────────────────── */
    const K = (t, v = 1) => kick.triggerAttackRelease('A0', 0.2, t, v);
    const CL = (t, v = 1) => [0, 0.009, 0.019].forEach((d, i) => clap.triggerAttackRelease(0.08, t + d, v * (i === 2 ? 1 : 0.6)));
    const H = (t, v = 1) => { hatPan.pan.setValueAtTime(rnd() * 0.6 - 0.3, t); hat.triggerAttackRelease(0.02, t, v); };
    const OH = (t, v = 1) => ohat.triggerAttackRelease(0.1, t, v);
    const B = (note, t, d = S * 0.9, v = 1) => bass.triggerAttackRelease(note, d, t, v);
    const GL = (t, v = 1, hi = false) => {
      glitchPan.pan.setValueAtTime(rnd() * 1.4 - 0.7, t);
      const n = (hi ? 1400 : 500) + rnd() * (hi ? 2600 : 1400);
      glitch.triggerAttackRelease(n, 0.03, t, v);
    };
    const T = (t, v = 1) => tick.triggerAttackRelease(3200 + rnd() * 900, 0.01, t, v);
    const POP = (t, v = 1) => pop.triggerAttackRelease(1800 + rnd() * 1600, 0.03, t, v);
    const IMPACT = (t, v = 1) => { boom.triggerAttackRelease('A0', 1.0, t, v); burst.triggerAttackRelease(0.3, t, v * 0.8); crash.triggerAttackRelease(0.9, t, v * 0.8); };
    const HIT = (t, v = 1) => { K(t, v); crash.triggerAttackRelease(0.4, t, v * 0.5); };
    const CHIRP = (t0, dur, v = 0.7) => { for (let t = t0; t < t0 + dur; t += 1 / 30) GL(t, v * (0.6 + rnd() * 0.4), true); };
    const RISE = (t0, t1, top = 7000) => {
      riserF.frequency.setValueAtTime(260, t0);
      riserF.frequency.exponentialRampToValueAtTime(top, t1);
      riser.triggerAttackRelease(t1 - t0, t0);
    };

    // groove: syncopated 16th-note bar (the film's SYNC_PATTERN drives the bass)
    const SYNC = [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1];
    const KICKS = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0];
    const ROOTS = ['A1', 'A1', 'C2', 'G1'];
    const groove = (from, to, {hats = true, bassOn = true, kickOn = true, clapOn = true, oct = 0} = {}) => {
      for (let t = from; t < to - 1e-6; t += S) {
        const step = Math.round(t / S) % 16;
        const bar = Math.floor(t / BAR + 1e-6);
        if (kickOn && KICKS[step]) K(t, step === 0 ? 1 : 0.85);
        if (clapOn && (step === 4 || step === 12)) CL(t);
        if (hats) { H(t, step % 2 ? 1 : 0.45); if (step === 14) OH(t); }
        if (bassOn && SYNC[step]) {
          const root = ROOTS[bar % 4];
          const note = step === 10 ? Tone.Frequency(root).transpose(12 + oct).toNote() : Tone.Frequency(root).transpose(oct).toNote();
          B(note, t, S * (step === 15 ? 0.5 : 0.9), step === 0 ? 1 : 0.8);
        }
      }
    };

    /* ── 0.000 – 4.000 · intro ─────────────────────────────── */
    pad.triggerAttackRelease(['A2', 'E3'], 3.3, 0, 0.7);
    for (let t = 0; t < 0.5; t += S) GL(t, 0.55);                              // pixel checker flicker
    HIT(0.5, 0.7);
    [0.5, 0.5625, 0.625, 0.6875].forEach((t) => T(t, 0.9));                  // logotype glyphs appear
    for (let t = 0.5; t < 0.9375; t += S / 2) if (rnd() > 0.45) GL(t, 0.45, true); // glyphs jumping
    for (let t = 1.0; t < 3.5625; t += S) H(t, Math.round(t / S) % 2 ? 0.7 : 0.3);
    [1.1875, 1.375, 1.6875, 2.1875, 2.6875, 3.15625].forEach((t, i) => K(t, i === 3 ? 1 : 0.75)); // kicks on the cuts
    [1.25, 1.375, 1.5].forEach((t) => GL(t, 0.5));                           // pixel glyph in ring / panel
    crash.triggerAttackRelease(0.5, 1.6875, 0.35);                            // streak / globe
    GL(1.8125, 0.6, true); GL(1.875, 0.6, true);                              // earth, white block
    CL(2.0); B('A1', 2.0, 0.3);                                               // hatch
    for (let i = 0; i < 6; i++) T(2.1875 + i * 0.075);                       // L·O·C·K·U·P
    for (let i = 0; i < 2; i++) T(2.6875 + i * 0.02);                        // IN
    CL(3.0625, 0.8);                                                          // white block over IN
    for (let i = 0; i < 6; i++) T(3.15625 + i * 0.02);                       // MOTION
    B('A1', 2.6875, 0.2); B('C2', 3.15625, 0.2);
    RISE(3.5625, 4.0, 5200);                                                  // breath → drop
    T(3.875, 1.2);                                                            // the lone dash

    /* ── 4.000 – 12.344 · grooves ──────────────────────────── */
    IMPACT(4.0, 0.9);
    CHIRP(4.0, 0.09, 0.6);                                                    // "50" decodes
    groove(4.0, 8.0);
    CHIRP(4.1875, 0.05, 0.4); CHIRP(4.25, 0.05, 0.4);                         // labels set
    [5.1875, 5.3125, 5.375, 5.5, 5.625, 5.6875, 5.75].forEach((t) => GL(t, 0.8, true)); // block steps
    CHIRP(5.875, 0.42, 0.45);                                                 // AE / MOV / GIF
    [6.1875, 6.3125].forEach((t) => POP(t, 0.8));                             // block hops
    crash.triggerAttackRelease(0.6, 6.875, 0.4);                              // WWW
    [7.0625, 7.1875, 7.3125].forEach((t) => GL(t, 0.5));                      // globe slides out
    crash.triggerAttackRelease(0.4, 7.5, 0.55); POP(7.59375, 0.9);            // flash · SI<
    [7.6875, 7.75, 7.875].forEach((t) => T(t, 1.1));                          // Three · Six · Five

    groove(8.0, 11.875, {oct: 0});
    [8.0625, 8.15625, 8.25].forEach((t) => GL(t, 0.9));                       // blob morphs
    POP(8.5, 0.6); GL(8.8125, 0.7, true);                                     // chart · grids
    CHIRP(9.125, 0.25, 0.35);                                                 // waveform draws
    CHIRP(9.375, 0.19, 0.7);                                                  // decoder burst
    for (let t = 9.5625; t < 10.125; t += S / 2) B('A1', t, S * 0.4, 0.35 + 0.3 * Math.abs(Math.sin(t * 7))); // dumbbell wobble
    HIT(10.125, 0.6);                                                         // NEW EDITION
    for (let t = 10.125; t < 10.6; t += 1 / 15) if (rnd() > 0.5) T(t, 0.6); // letters fill in
    crash.triggerAttackRelease(0.7, 10.6875, 0.45);                           // © ring
    [10.6875, 10.75, 10.8125, 10.875].forEach((t) => T(t, 0.8));             // ring clicks into place
    [11.125, 11.25, 11.3125].forEach((t) => GL(t, 0.9));                      // invader stutter
    [11.5, 11.5625, 11.625, 11.75].forEach((t) => T(t, 0.9));                // crosshair opens
    for (let i = 0, t = 11.875; t < 12.344; t += S / 2, i++) CL(t, 0.25 + i * 0.09); // snare roll into the climax
    RISE(11.5, 12.34375, 9000);
    GL(12.0, 1, true);                                                        // serial
    for (let t = 12.0625; t < 12.344; t += S) POP(t, 0.5);                    // dot matrix

    /* ── 12.344 – 15.375 · climax: the lockup sheet ────────── */
    const C0 = 12.34375;
    IMPACT(C0, 1);
    GL(C0 + 0.0625, 1, true); GL(C0 + 0.125, 1, true);                        // sheet assembles
    pad.triggerAttackRelease(['A2', 'E3', 'C4'], 2.9, C0, 0.6);
    groove(C0 + 0.03125, C0 + 1.25, {oct: 12});
    for (let t = C0; t < C0 + 1.25; t += S / 2) H(t + S / 4, 0.5);            // 32nd hats lift the climax
    for (let t = C0 + 0.875; t < C0 + 1.325; t += 1 / 30) T(t, 0.35);         // tagline types out
    for (let t = C0 + 1.25; t < C0 + 1.625; t += S / 4) GL(t, 0.75, rnd() > 0.5); // glitch: beat-repeat stutter
    HIT(C0 + 1.3125, 0.8); HIT(C0 + 1.4375, 0.8);                             // invert window · white blocks
    groove(C0 + 1.625, C0 + 2.8125, {oct: 12});
    for (let t = C0 + 1.625; t < C0 + 2.8125; t += S / 2) H(t + S / 4, 0.5);
    // tape stop on the dim (15.156 → 15.281)
    const ts = C0 + 2.8125;
    tape.start(ts).stop(ts + 0.2);
    tape.frequency.setValueAtTime(110, ts); tape.frequency.exponentialRampToValueAtTime(18, ts + 0.18);
    tapeGain.gain.setValueAtTime(0.0, ts); tapeGain.gain.linearRampToValueAtTime(0.32, ts + 0.01); tapeGain.gain.linearRampToValueAtTime(0, ts + 0.19);
    IMPACT(C0 + 2.9375, 0.85);                                                // invert
    GL(15.375, 1, true); GL(15.4375, 1);                                       // chop

    /* ── 15.5 – 16.9375 · breakdown ────────────────────────── */
    [15.5, 15.625, 15.75, 15.875].forEach((t, i) => glitch.triggerAttackRelease(900 - i * 180, 0.04, t, 0.8)); // pixels collapse
    T(16.0, 1.2);                                                             // hourglass stem
    IMPACT(16.125, 1);                                                        // the ×
    pad.triggerAttackRelease(['A1', 'E2', 'A2'], 0.8, 16.125, 0.5);
    RISE(16.2, 16.6, 4000);                                                   // streaks
    T(16.5, 1);                                                               // × settles small
    RISE(16.6, 16.9375, 6000);

    /* ── 16.9375 – 20.0 · brand + URL ──────────────────────── */
    boom.triggerAttackRelease('A0', 1.5, 16.9375, 0.9);
    crash.triggerAttackRelease(1.4, 16.9375, 0.6);
    pad.triggerAttackRelease(['A2', 'E3', 'G3', 'B3', 'C4'], 2.4, 16.9375, 0.85); // final chord (Am add9)
    T(16.9375, 1.1); T(17.0, 1.1);                                            // words slide up
    for (let i = 0; i < 18; i++) POP(17.6875 + rnd() * 0.3, 0.55);            // URL letters pop in
    for (let i = 0; i < 18; i++) POP(19.73 + rnd() * 0.12, 0.45);             // …and out
    flush();
  }, seconds, 2, 48000);

  /* AudioBuffer → 16-bit PCM WAV (base64) */
  const ch = [buffer.getChannelData(0), buffer.getChannelData(1)], n = ch[0].length;
  const view = new DataView(new ArrayBuffer(44 + n * 4));
  const w = (o, s) => [...s].forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); view.setUint32(4, 36 + n * 4, true); w(8, 'WAVEfmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, 2, true); view.setUint32(24, 48000, true); view.setUint32(28, 48000 * 4, true); view.setUint16(32, 4, true); view.setUint16(34, 16, true);
  w(36, 'data'); view.setUint32(40, n * 4, true);
  for (let i = 0, o = 44; i < n; i++) for (let c = 0; c < 2; c++, o += 2) view.setInt16(o, Math.max(-1, Math.min(1, ch[c][i])) * 0x7fff, true);
  const bytes = new Uint8Array(view.buffer); let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
};
