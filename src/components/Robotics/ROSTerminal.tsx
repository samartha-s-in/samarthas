"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Trash2, CornerDownLeft } from 'lucide-react';
import styles from './ROSTerminal.module.css';

interface LogLine {
  id: number;
  node: string;
  level: 'INFO' | 'WARN' | 'DATA';
  message: string;
  time: string;
}

const sampleMessages = [
  { node: 'nav2_controller', level: 'INFO' as const, message: 'Global planner computed path: 42 waypoints. Trajectory smooth.' },
  { node: 'mavros_node', level: 'DATA' as const, message: 'EKF2 fused: GPS 3D Fix (16 sats), Alt: 14.8m, Battery: 15.6V.' },
  { node: 'lidar_slam', level: 'INFO' as const, message: 'Scan matching: Cartographer loop closure confirmed. Error < 0.02m.' },
  { node: 'vision_qc', level: 'DATA' as const, message: 'TensorFlow inference: SKU match 99.4%, Expiry OCR verified.' },
  { node: 'esp32_gateway', level: 'INFO' as const, message: 'Telemetry packet ACK received over LoRaWAN (RSSI: -68 dBm).' },
  { node: 'nav2_controller', level: 'INFO' as const, message: 'Costmap inflation radius updated: 1.20m. Dynamic obstacle routed.' },
];

export const ROSTerminal: React.FC = () => {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [commandInput, setCommandInput] = useState('');
  const terminalBodyRef = useRef<HTMLDivElement | null>(null);

  // Initial seed logs
  useEffect(() => {
    const initial: LogLine[] = [
      { id: 1, node: 'system', level: 'INFO', message: 'ROS 2 Humble / Jazzy environment initialized.', time: '00:00:01' },
      { id: 2, node: 'hardware', level: 'INFO', message: 'Pixhawk 6X & Companion Computer linked via UART @ 921600 baud.', time: '00:00:02' },
      { id: 3, node: 'lidar_slam', level: 'INFO', message: 'Planar LiDAR point cloud active on /scan topic (360° @ 15Hz).', time: '00:00:03' },
    ];
    setLogs(initial);
  }, []);

  // Streaming log generator
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const sample = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      setLogs((prev) => [
        ...prev.slice(-30), // keep last 30 logs
        {
          id: Date.now() + Math.random(),
          node: sample.node,
          level: sample.level,
          message: sample.message,
          time: timeStr,
        },
      ]);
    }, 2400);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Auto scroll to bottom
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim().toLowerCase();
    if (!cmd) return;

    let responseMsg = '';
    if (cmd === 'help') {
      responseMsg = 'Available commands: ros2 topic list, ros2 node list, status, catia, clear, help';
    } else if (cmd === 'ros2 topic list') {
      responseMsg = '/cmd_vel, /odom, /scan, /mavros/state, /camera/rgb, /esp32/telemetry';
    } else if (cmd === 'ros2 node list') {
      responseMsg = '/nav2_controller, /mavros_node, /slam_cartographer, /vision_qc_node, /esp32_bridge';
    } else if (cmd === 'status') {
      responseMsg = 'STATUS: ALL PLATFORMS NOMINAL. ROS 2: ACTIVE | EKF2: ARMED | AUTONOMOUS FLIGHT: READY';
    } else if (cmd === 'catia') {
      responseMsg = 'CATIA V5: GSLV Mk II rocket assembly & RoboGleam dual articulated arms parametrically verified.';
    } else if (cmd === 'clear') {
      setLogs([]);
      setCommandInput('');
      return;
    } else {
      responseMsg = `Command not recognized: "${cmd}". Type "help" for options.`;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    setLogs((prev) => [
      ...prev,
      { id: Date.now(), node: 'user_cli', level: 'INFO', message: `$ ${commandInput}`, time: timeStr },
      { id: Date.now() + 1, node: 'ros2_core', level: 'DATA', message: responseMsg, time: timeStr },
    ]);

    setCommandInput('');
  };

  return (
    <div className={`glass-panel ${styles.terminalCard}`}>
      {/* Terminal Title Bar */}
      <div className={styles.titleBar}>
        <div className={styles.controlsLeft}>
          <span className={`${styles.circleBtn} ${styles.redBtn}`} />
          <span className={`${styles.circleBtn} ${styles.yellowBtn}`} />
          <span className={`${styles.circleBtn} ${styles.greenBtn}`} />
          <span className={styles.windowTitle}>samartha@robotics-node:~ (ROS 2 Humble / Nav2)</span>
        </div>

        <div className={styles.actionRight}>
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={styles.streamBtn}
            title={isStreaming ? 'Pause Telemetry Stream' : 'Resume Telemetry Stream'}
          >
            {isStreaming ? <Pause size={13} /> : <Play size={13} />}
            <span>{isStreaming ? 'STREAMING' : 'PAUSED'}</span>
          </button>
          <button
            onClick={() => setLogs([])}
            className={styles.clearBtn}
            title="Clear Terminal Output"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Terminal Logs Output */}
      <div className={styles.terminalBody} ref={terminalBodyRef}>
        {logs.map((log) => (
          <div key={log.id} className={styles.logRow}>
            <span className={styles.timestamp}>[{log.time}]</span>
            <span className={`${styles.levelBadge} ${styles[log.level]}`}>[{log.level}]</span>
            <span className={styles.nodeTag}>[{log.node}]:</span>
            <span className={styles.logMessage}>{log.message}</span>
          </div>
        ))}
      </div>

      {/* Interactive Command Line Input */}
      <form onSubmit={handleCommandSubmit} className={styles.commandForm}>
        <div className={styles.promptLabel}>
          <span>samartha@ros2:~$</span>
        </div>
        <input
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          placeholder="Try typing 'help', 'ros2 topic list', or 'status'..."
          className={styles.cliInput}
        />
        <button type="submit" className={styles.enterBtn} title="Execute command">
          <CornerDownLeft size={14} />
        </button>
      </form>
    </div>
  );
};

export default ROSTerminal;
