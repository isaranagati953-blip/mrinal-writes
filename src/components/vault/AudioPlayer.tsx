"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import styles from "./AudioPlayer.module.css";

type Props = {
  sessionId: string;
  streamUrl: string;
  durationSecs: number;
  resumeAt: number;
};

export default function AudioPlayer({
  sessionId, streamUrl, durationSecs, resumeAt,
}: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(resumeAt);
  const [duration, setDuration] = useState(durationSecs);
  const [loading, setLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  // Resume from saved position
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = resumeAt;
  }, [resumeAt]);

  // Save progress to server (debounced — every 10s of playback)
  const saveProgress = useCallback(async (positionSecs: number) => {
    try {
      await fetch("/api/audio/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, positionSecs }),
      });
    } catch { /* silent fail — not critical */ }
  }, [sessionId]);

  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);

    // Debounce save — only persist every ~10 real seconds
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveProgress(Math.floor(audio.currentTime));
    }, 10000);
  }

  function handleLoadedMetadata() {
    const audio = audioRef.current;
    if (!audio) return;
    setDuration(audio.duration);
    setLoading(false);
    // Resume position
    audio.currentTime = resumeAt;
  }

  function handleEnded() {
    setPlaying(false);
    saveProgress(Math.floor(duration));
    // Mark completed
    fetch("/api/audio/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, positionSecs: Math.floor(duration), completed: true }),
    }).catch(() => {});
  }

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!audio || !bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * duration;
    setCurrentTime(audio.currentTime);
  }

  function skip(secs: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + secs));
  }

  function changeRate(rate: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = rate;
    setPlaybackRate(rate);
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio) return;
    const v = parseFloat(e.target.value);
    audio.volume = v;
    setVolume(v);
    setMuted(v === 0);
  }

  function toggleMute() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !muted;
    setMuted(!muted);
  }

  const pct = duration ? (currentTime / duration) * 100 : 0;
  const rates = [0.75, 1, 1.25, 1.5, 1.75, 2];

  return (
    <div className={styles.player}>
      {/* Hidden audio element — no controls attribute = no browser download button */}
      <audio
        ref={audioRef}
        src={streamUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        preload="metadata"
        // No `controls` prop — we render our own UI
      />

      {/* Progress bar */}
      <div
        ref={progressRef}
        className={styles.progressBar}
        onClick={seek}
        role="slider"
        aria-label="Seek"
        aria-valuenow={Math.floor(currentTime)}
        aria-valuemax={Math.floor(duration)}
      >
        <div className={styles.progressFill} style={{ width: `${pct}%` }} />
        <div className={styles.progressThumb} style={{ left: `${pct}%` }} />
      </div>

      {/* Time */}
      <div className={styles.timeRow}>
        <span className={styles.time}>{fmt(currentTime)}</span>
        <span className={styles.time}>{fmt(duration)}</span>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        {/* Skip back */}
        <button onClick={() => skip(-30)} className={styles.skipBtn} title="Back 30s">
          <span className={styles.skipLabel}>30</span>
          <span className={styles.skipIcon}>↩</span>
        </button>

        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className={styles.playBtn}
          disabled={loading}
          aria-label={playing ? "Pause" : "Play"}
        >
          {loading ? (
            <span className={styles.spinner} />
          ) : playing ? (
            <span className={styles.pauseIcon}>⏸</span>
          ) : (
            <span className={styles.playIcon}>▶</span>
          )}
        </button>

        {/* Skip forward */}
        <button onClick={() => skip(30)} className={styles.skipBtn} title="Forward 30s">
          <span className={styles.skipIcon}>↪</span>
          <span className={styles.skipLabel}>30</span>
        </button>
      </div>

      {/* Bottom row: speed + volume */}
      <div className={styles.bottomRow}>
        {/* Playback speed */}
        <div className={styles.rateRow}>
          {rates.map((r) => (
            <button
              key={r}
              onClick={() => changeRate(r)}
              className={`${styles.rateBtn} ${playbackRate === r ? styles.rateActive : ""}`}
            >
              {r}×
            </button>
          ))}
        </div>

        {/* Volume */}
        <div className={styles.volumeRow}>
          <button onClick={toggleMute} className={styles.muteBtn} aria-label="Mute">
            {muted || volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
          </button>
          <input
            type="range"
            min={0} max={1} step={0.05}
            value={muted ? 0 : volume}
            onChange={handleVolumeChange}
            className={styles.volumeSlider}
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}

function fmt(secs: number): string {
  if (!secs || isNaN(secs)) return "0:00";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${m}:${pad(s)}`;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
