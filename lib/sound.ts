function isBrowser(): boolean {
  return typeof window !== "undefined";
}

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (!isBrowser()) return null;
  if (!audioCtx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  }
  return audioCtx;
}

// Preloaded success sound (cash register "cha-ching", CC0).
let successAudio: HTMLAudioElement | null = null;
function getSuccessAudio(): HTMLAudioElement | null {
  if (!isBrowser()) return null;
  if (!successAudio) {
    const a = new Audio("/sounds/cash-register.mp3");
    a.preload = "auto";
    a.volume = 0.7;
    successAudio = a;
  }
  return successAudio;
}

let unlocked = false;
function unlock(): void {
  if (unlocked || !isBrowser()) return;
  unlocked = true;
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") void ctx.resume();
  // Prime the media element so later plays aren't blocked by autoplay policy.
  const a = getSuccessAudio();
  if (a) {
    a.muted = true;
    void a
      .play()
      .then(() => {
        a.pause();
        a.currentTime = 0;
        a.muted = false;
      })
      .catch(() => {
        a.muted = false;
      });
  }
}

if (isBrowser()) {
  const events = ["pointerdown", "keydown", "touchstart"];
  const handler = () => {
    unlock();
    events.forEach((e) => document.removeEventListener(e, handler));
  };
  events.forEach((e) => document.addEventListener(e, handler));
}

function blip(freq: number, duration: number): void {
  if (!isBrowser()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.value = 0.08;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export function playSuccess(): void {
  if (!isBrowser()) return;
  unlock();
  const a = getSuccessAudio();
  if (!a) return;
  try {
    a.currentTime = 0;
  } catch {
    /* ignore */
  }
  a.volume = 0.7;
  void a.play().catch(() => {});
}

export function playClick(): void {
  blip(180, 0.05);
}

export function playAdd(): void {
  blip(440, 0.05);
}

export function playError(): void {
  blip(90, 0.12);
}

// Pleasant two-tone chime for low-stock / out-of-stock alerts.
export function playNotify(): void {
  if (!isBrowser()) return;
  try {
    unlock();
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") void ctx.resume();
    const now = ctx.currentTime;
    const beep = (freq: number, offset: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t0 = now + offset;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    };
    beep(784, 0, 0.18); // G5
    beep(1047, 0.12, 0.24); // C6
  } catch {
    /* audio not available — ignore */
  }
}
