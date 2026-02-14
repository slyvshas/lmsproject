// ============================================================================
// Video Player with Progress Tracking
// ============================================================================
// Professional video player that tracks watch time and completion

import React, { useState, useRef, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { updateLessonProgress } from '../../services/progressService';
import './VideoPlayer.css';

const VideoPlayer = ({ videoUrl, lessonId, enrollmentId, duration }) => {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const progressUpdateInterval = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setTotalDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setWatchedSeconds((prev) => prev + 1);
    };

    const handleEnded = () => {
      setPlaying(false);
      markLessonComplete();
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Update progress every 30 seconds
  useEffect(() => {
    if (playing && enrollmentId && lessonId) {
      progressUpdateInterval.current = setInterval(() => {
        saveProgress();
      }, 30000);
    } else {
      if (progressUpdateInterval.current) {
        clearInterval(progressUpdateInterval.current);
      }
    }

    return () => {
      if (progressUpdateInterval.current) {
        clearInterval(progressUpdateInterval.current);
      }
    };
  }, [playing, watchedSeconds]);

  const saveProgress = async () => {
    if (!enrollmentId || !lessonId || watchedSeconds === 0) return;

    const completed = currentTime / totalDuration >= 0.9; // 90% watched = complete

    await updateLessonProgress(enrollmentId, lessonId, {
      completed,
      time_spent_seconds: watchedSeconds,
    });
  };

  const markLessonComplete = async () => {
    if (!enrollmentId || !lessonId) return;

    await updateLessonProgress(enrollmentId, lessonId, {
      completed: true,
      time_spent_seconds: watchedSeconds,
    });
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (playing) {
      video.pause();
    } else {
      video.play();
    }
    setPlaying(!playing);
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * totalDuration;
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (muted) {
      video.volume = volume || 0.5;
      setMuted(false);
    } else {
      video.volume = 0;
      setMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const container = videoRef.current.parentElement;
    if (!fullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setFullscreen(!fullscreen);
  };

  const skip = (seconds) => {
    const video = videoRef.current;
    video.currentTime = Math.max(0, Math.min(totalDuration, currentTime + seconds));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div
      className="video-player-container"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(playing)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="video-element"
        onClick={togglePlay}
      />

      <div className={`video-controls ${showControls ? 'visible' : 'hidden'}`}>
        <div className="progress-bar" onClick={handleSeek}>
          <div className="progress-filled" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className="control-buttons">
          <div className="left-controls">
            <button onClick={togglePlay} className="control-btn">
              {playing ? '⏸' : '▶'}
            </button>
            <button onClick={() => skip(-10)} className="control-btn skip-btn">
              ⏪ 10s
            </button>
            <button onClick={() => skip(10)} className="control-btn skip-btn">
              10s ⏩
            </button>
            <span className="time-display">
              {formatTime(currentTime)} / {formatTime(totalDuration)}
            </span>
          </div>

          <div className="right-controls">
            <div className="volume-control">
              <button onClick={toggleMute} className="control-btn">
                {muted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                className="volume-slider"
              />
            </div>
            <button onClick={toggleFullscreen} className="control-btn">
              {fullscreen ? '🗗' : '⛶'}
            </button>
          </div>
        </div>
      </div>

      {!playing && (
        <div className="play-overlay" onClick={togglePlay}>
          <div className="play-button-large">▶</div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
