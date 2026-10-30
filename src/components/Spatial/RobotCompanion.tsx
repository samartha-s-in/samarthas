"use client";

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Bot, Sparkles, X, Zap } from 'lucide-react';
import styles from './RobotCompanion.module.css';

export const RobotCompanion: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [vibeMode, setVibeMode] = useState(false);
  const [activeLog, setActiveLog] = useState('VSS Visual Servoing active. Tracking 6-DOF robotic manipulator.');
  const botBtnRef = useRef<HTMLButtonElement | null>(null);
  const pupilRef = useRef<HTMLDivElement | null>(null);

  // Eye tracks cursor globally with direct DOM transform (zero React re-renders)
  useEffect(() => {
    let animId: number | null = null;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!botBtnRef.current || !pupilRef.current) return;
      const rect = botBtnRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.hypot(deltaX, deltaY);

      const maxRadius = 7;
      const clampedDist = Math.min(distance, 400);
      const ratio = clampedDist / 400;

      const angle = Math.atan2(deltaY, deltaX);
      targetX = Math.cos(angle) * maxRadius * ratio;
      targetY = Math.sin(angle) * maxRadius * ratio;

      if (!animId) {
        animId = requestAnimationFrame(() => {
          if (pupilRef.current) {
            pupilRef.current.style.transform = `translate(${targetX.toFixed(1)}px, ${targetY.toFixed(1)}px)`;
          }
          animId = null;
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  const toggleVibeMode = () => {
    const next = !vibeMode;
    setVibeMode(next);
    if (next) {
      document.body.classList.add('vibe-coding-active');
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: 0.9, y: 0.9 },
        colors: ['#00e5ff', '#3b82f6', '#8b5cf6', '#10b981'],
      });
      setActiveLog('VIBE CODING MODE: ENGAGED. Cybernetic matrices overclocked.');
    } else {
      document.body.classList.remove('vibe-coding-active');
      setActiveLog('VIBE CODING MODE: STANDBY.');
    }
  };

  return (
    <div className={styles.companionWrapper}>
      {/* Expanded Interactive HUD Drawer */}
      {isOpen && (
        <div className={`glass-panel ${styles.hudModal}`}>
          <div className={styles.modalHeader}>
            <div className={styles.headerTitle}>
              <Bot size={16} className={styles.botIcon} />
              <span className={styles.botName}>A.R.I.A // ROBOTIC COPILOT</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={styles.closeBtn}
              aria-label="Close Assistant"
            >
              <X size={15} />
            </button>
          </div>

          <div className={styles.modalBody}>
            {/* Status Chip */}
            <div className={styles.statusRow}>
              <span className="pulse-dot" />
              <span className={styles.statusText}>AUTONOMOUS TELEMETRY ENGINE</span>
            </div>

            {/* Quick Live Readout */}
            <div className={styles.readoutCard}>
              <div className={styles.readoutKey}>CURRENT TELEMETRY STATUS</div>
              <div className={styles.readoutVal}>{activeLog}</div>
            </div>

            {/* Control Toggles */}
            <div className={styles.actionGrid}>
              <button
                onClick={toggleVibeMode}
                className={`${styles.actionBtn} ${vibeMode ? styles.vibeActiveBtn : ''}`}
              >
                <Sparkles size={14} />
                <span>{vibeMode ? 'Vibe Mode Active' : 'Engage Vibe Mode'}</span>
              </button>

              <button
                onClick={() => {
                  confetti({
                    particleCount: 60,
                    spread: 80,
                    origin: { x: 0.9, y: 0.9 },
                  });
                }}
                className={styles.actionBtn}
              >
                <Zap size={14} />
                <span>Pulse Thrusters</span>
              </button>
            </div>

            {/* Quick Jump Links */}
            <div className={styles.quickLinksRow}>
              <a href="#lab" onClick={() => setIsOpen(false)} className={styles.quickLink}>
                #3D Lab
              </a>
              <a href="#projects" onClick={() => setIsOpen(false)} className={styles.quickLink}>
                #Projects
              </a>
              <a href="#publication" onClick={() => setIsOpen(false)} className={styles.quickLink}>
                #IEEE Paper
              </a>
              <a href="/contact" onClick={() => setIsOpen(false)} className={styles.quickLink}>
                #Contact
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating Robot Eye Mascot Trigger */}
      <button
        ref={botBtnRef}
        onClick={() => setIsOpen(!isOpen)}
        className={styles.botOrbBtn}
        title="Open Robotic AI Companion &amp; Vibe Coding Controls"
        aria-label="Robotic Assistant"
      >
        {/* Outer Gyro Ring */}
        <div className={styles.outerGyroRing} />

        {/* Robot Head / Chassis */}
        <div className={styles.orbChassis}>
          {/* Cyber Visor Screen */}
          <div className={styles.visorScreen}>
            {/* Scanning Laser Line */}
            <div className={styles.scanLaser} />

            {/* Eye Pupil with responsive gaze */}
            <div ref={pupilRef} className={styles.eyePupil} />
          </div>
        </div>
      </button>
    </div>
  );
};

export default RobotCompanion;
