"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Trash2, CornerDownLeft, Radio, Terminal, Send, Eye, Radar } from 'lucide-react';
import styles from './ROSTerminal.module.css';

interface LogLine {
  id: number;
  node: string;
  level: 'INFO' | 'WARN' | 'DATA';
  message: string;
  time: string;
}

export const ROSTerminal: React.FC = () => {
  // Navigation Tabs: 'cli' | 'publishers' | 'subscribers' | 'lidar_nav'
  const [activeTab, setActiveTab] = useState<'cli' | 'publishers' | 'subscribers' | 'lidar_nav'>('cli');

  // Logs state
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [commandInput, setCommandInput] = useState('');
  const terminalBodyRef = useRef<HTMLDivElement | null>(null);

  // Publisher State
  const [selectedPubTopic, setSelectedPubTopic] = useState('/cmd_vel');
  const [linearX, setLinearX] = useState(0.45);
  const [angularZ, setAngularZ] = useState(0.20);
  const [pubRate, setPubRate] = useState(20);

  // Subscriber State
  const [selectedSubTopic, setSelectedSubTopic] = useState('/odom');
  const [liveOdom, setLiveOdom] = useState({
    x: 2.14,
    y: 1.08,
    z: 0.0,
    linear_vel: 0.45,
    angular_vel: 0.20,
    heading_deg: 42.5,
    battery_v: 16.4,
    rssi_dbm: -64,
  });

  // LiDAR Radar Canvas Ref
  const radarCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initial seed logs
  useEffect(() => {
    const initial: LogLine[] = [
      { id: 1, node: 'system', level: 'INFO', message: 'ROS 2 Humble / Jazzy environment initialized.', time: '00:00:01' },
      { id: 2, node: 'hardware', level: 'INFO', message: 'Pixhawk 6X & Companion Computer linked via UART @ 921600 baud.', time: '00:00:02' },
      { id: 3, node: 'lidar_slam', level: 'INFO', message: 'Planar LiDAR point cloud active on /scan topic (360° @ 15Hz).', time: '00:00:03' },
      { id: 4, node: 'nav2_controller', level: 'INFO', message: 'Nav2 global costmap generated: 42 waypoints routed.', time: '00:00:04' },
    ];
    setLogs(initial);
  }, []);

  // Streaming log generator
  useEffect(() => {
    if (!isStreaming) return;

    const sampleMessages = [
      { node: 'nav2_controller', level: 'INFO' as const, message: 'Global planner path updated: 42 waypoints. DWB velocity smooth.' },
      { node: 'mavros_node', level: 'DATA' as const, message: 'EKF2 fused: GPS 3D Fix (16 sats), Alt: 14.8m, Battery: 16.2V.' },
      { node: 'lidar_slam', level: 'INFO' as const, message: 'Scan matching: Cartographer loop closure confirmed. Error < 0.018m.' },
      { node: 'vision_qc', level: 'DATA' as const, message: 'TensorFlow inference: SKU match 99.4%, Expiry OCR verified.' },
      { node: 'esp32_gateway', level: 'INFO' as const, message: 'Telemetry packet ACK received over LoRaWAN (RSSI: -64 dBm).' },
      { node: 'nav2_controller', level: 'INFO' as const, message: 'Costmap inflation radius updated: 1.20m. Dynamic obstacle routed.' },
    ];

    const interval = setInterval(() => {
      const sample = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      setLogs((prev) => [
        ...prev.slice(-30),
        {
          id: Date.now() + Math.random(),
          node: sample.node,
          level: sample.level,
          message: sample.message,
          time: timeStr,
        },
      ]);

      // Telemetry drift simulation for subscriber
      setLiveOdom((prev) => ({
        x: Number((prev.x + 0.02 * Math.cos((prev.heading_deg * Math.PI) / 180)).toFixed(2)),
        y: Number((prev.y + 0.02 * Math.sin((prev.heading_deg * Math.PI) / 180)).toFixed(2)),
        z: 0.0,
        linear_vel: Number((0.42 + Math.sin(Date.now() * 0.002) * 0.06).toFixed(2)),
        angular_vel: Number((0.18 + Math.cos(Date.now() * 0.003) * 0.04).toFixed(2)),
        heading_deg: Number(((prev.heading_deg + 0.8) % 360).toFixed(1)),
        battery_v: Number((16.4 - Math.random() * 0.02).toFixed(2)),
        rssi_dbm: -64 + Math.floor(Math.random() * 4) - 2,
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Auto scroll CLI terminal to bottom
  useEffect(() => {
    if (activeTab === 'cli' && terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [logs, activeTab]);

  // ========================================================
  // 2D Polar LiDAR Scanner Radar Sweep Canvas (/scan Session)
  // ========================================================
  useEffect(() => {
    if (activeTab !== 'lidar_nav') return;

    const canvas = radarCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let sweepAngle = 0;

    // Simulated 360 degree obstacle ranges (meters)
    const obstaclePoints: { angle: number; dist: number }[] = [
      { angle: 35, dist: 80 },
      { angle: 42, dist: 75 },
      { angle: 48, dist: 78 },
      { angle: 120, dist: 95 },
      { angle: 125, dist: 90 },
      { angle: 210, dist: 65 },
      { angle: 215, dist: 62 },
      { angle: 220, dist: 68 },
      { angle: 310, dist: 110 },
      { angle: 315, dist: 108 },
    ];

    const renderRadar = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const maxRadius = cx - 12;

      ctx.clearRect(0, 0, w, h);

      // 1. Concentric Range Rings (1m, 2m, 3m, 4m)
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.18)';
      ctx.lineWidth = 1;

      for (let r = 1; r <= 4; r++) {
        const rad = (maxRadius / 4) * r;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(0, 229, 255, 0.5)';
        ctx.font = '8px monospace';
        ctx.fillText(`${r * 2.5}m`, cx + rad - 18, cy - 4);
      }

      // 2. Polar Angle Crosshairs (0°, 90°, 180°, 270°)
      ctx.beginPath();
      ctx.moveTo(cx - maxRadius, cy);
      ctx.lineTo(cx + maxRadius, cy);
      ctx.moveTo(cx, cy - maxRadius);
      ctx.lineTo(cx, cy + maxRadius);
      ctx.stroke();

      // 3. Rotating Laser Radar Beam Sweep
      sweepAngle += 0.045; // ~15 Hz rotation
      const sweepX = cx + Math.cos(sweepAngle) * maxRadius;
      const sweepY = cy + Math.sin(sweepAngle) * maxRadius;

      // Laser sweep fan gradient
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius);
      grad.addColorStop(0, 'rgba(0, 229, 255, 0.25)');
      grad.addColorStop(1, 'rgba(0, 229, 255, 0.0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxRadius, sweepAngle - 0.45, sweepAngle);
      ctx.closePath();
      ctx.fill();

      // Leading beam ray
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(sweepX, sweepY);
      ctx.stroke();

      // 4. Detected LiDAR Obstacle Point Cloud
      obstaclePoints.forEach((pt) => {
        const rad = (pt.angle * Math.PI) / 180;
        const px = cx + Math.cos(rad) * pt.dist;
        const py = cy + Math.sin(rad) * pt.dist;

        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = pt.dist < 70 ? '#ef4444' : '#f59e0b';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 5. Center Robot Base (Ego Vehicle)
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#00e5ff';
      ctx.fill();

      // Forward heading tick
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx, cy - 14);
      ctx.stroke();

      animId = requestAnimationFrame(renderRadar);
    };

    renderRadar();

    return () => cancelAnimationFrame(animId);
  }, [activeTab]);

  // Execute CLI Command
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim().toLowerCase();
    if (!cmd) return;

    let responseMsg = '';
    if (cmd === 'help') {
      responseMsg = 'Available commands: ros2 topic list, ros2 node list, ros2 topic echo /scan, status, clear, help';
    } else if (cmd === 'ros2 topic list') {
      responseMsg = '/cmd_vel, /odom, /scan, /mavros/state, /camera/rgb, /esp32/telemetry, /initialpose';
    } else if (cmd === 'ros2 node list') {
      responseMsg = '/nav2_controller, /mavros_node, /slam_cartographer, /vision_qc_node, /esp32_bridge';
    } else if (cmd === 'ros2 topic echo /scan') {
      responseMsg = 'header: {stamp: 1718293021, frame_id: "laser_link"}, angle_min: -3.14159, angle_max: 3.14159, ranges: [1.42, 1.45, 1.41, 0.88, ... 360 points]';
    } else if (cmd === 'status') {
      responseMsg = 'STATUS: ALL PLATFORMS NOMINAL. ROS 2: ACTIVE | EKF2: ARMED | AUTONOMOUS FLIGHT: READY';
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

  // Publisher Trigger
  const handlePublishMessage = () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    setLogs((prev) => [
      ...prev,
      {
        id: Date.now(),
        node: 'topic_pub',
        level: 'DATA',
        message: `PUBLISHED to ${selectedPubTopic} -> linear: {x: ${linearX.toFixed(2)}, y: 0.0, z: 0.0}, angular: {z: ${angularZ.toFixed(2)}} @ ${pubRate}Hz`,
        time: timeStr,
      },
    ]);
  };

  return (
    <div className={`glass-panel ${styles.terminalCard}`}>
      {/* Terminal Title Bar */}
      <div className={styles.titleBar}>
        <div className={styles.controlsLeft}>
          <span className={`${styles.circleBtn} ${styles.redBtn}`} />
          <span className={`${styles.circleBtn} ${styles.yellowBtn}`} />
          <span className={`${styles.circleBtn} ${styles.greenBtn}`} />
          <span className={styles.windowTitle}>samartha@robotics-node:~ (ROS 2 Humble / Nav2 Stack)</span>
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

      {/* Navigation Tabs Bar */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.navTabBtn} ${activeTab === 'cli' ? styles.activeNavTab : ''}`}
          onClick={() => setActiveTab('cli')}
        >
          <Terminal size={13} />
          <span>ROS 2 CLI</span>
        </button>

        <button
          className={`${styles.navTabBtn} ${activeTab === 'publishers' ? styles.activeNavTab : ''}`}
          onClick={() => setActiveTab('publishers')}
        >
          <Send size={13} />
          <span>Publishers (/cmd_vel)</span>
        </button>

        <button
          className={`${styles.navTabBtn} ${activeTab === 'subscribers' ? styles.activeNavTab : ''}`}
          onClick={() => setActiveTab('subscribers')}
        >
          <Eye size={13} />
          <span>Subscribers (/odom)</span>
        </button>

        <button
          className={`${styles.navTabBtn} ${activeTab === 'lidar_nav' ? styles.activeNavTab : ''}`}
          onClick={() => setActiveTab('lidar_nav')}
        >
          <Radar size={13} />
          <span>LiDAR &amp; Nav2 (/scan)</span>
        </button>
      </div>

      {/* =======================================================
          TAB 1: Interactive ROS 2 CLI
          ======================================================= */}
      {activeTab === 'cli' && (
        <>
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

          <form onSubmit={handleCommandSubmit} className={styles.commandForm}>
            <div className={styles.promptLabel}>
              <span>samartha@ros2:~$</span>
            </div>
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Try 'ros2 topic list', 'ros2 topic echo /scan', or 'status'..."
              className={styles.cliInput}
            />
            <button type="submit" className={styles.enterBtn} title="Execute command">
              <CornerDownLeft size={14} />
            </button>
          </form>
        </>
      )}

      {/* =======================================================
          TAB 2: Topic Publishers
          ======================================================= */}
      {activeTab === 'publishers' && (
        <div className={styles.pubSubContainer}>
          <div className={styles.sideList}>
            <button
              className={`${styles.topicItemBtn} ${selectedPubTopic === '/cmd_vel' ? styles.activeTopicItem : ''}`}
              onClick={() => setSelectedPubTopic('/cmd_vel')}
            >
              <span className={styles.topicName}>/cmd_vel</span>
              <span className={styles.topicType}>geometry_msgs/msg/Twist</span>
            </button>
            <button
              className={`${styles.topicItemBtn} ${selectedPubTopic === '/mavros/setpoint_raw' ? styles.activeTopicItem : ''}`}
              onClick={() => setSelectedPubTopic('/mavros/setpoint_raw')}
            >
              <span className={styles.topicName}>/mavros/setpoint_raw</span>
              <span className={styles.topicType}>mavros_msgs/PositionTarget</span>
            </button>
            <button
              className={`${styles.topicItemBtn} ${selectedPubTopic === '/initialpose' ? styles.activeTopicItem : ''}`}
              onClick={() => setSelectedPubTopic('/initialpose')}
            >
              <span className={styles.topicName}>/initialpose</span>
              <span className={styles.topicType}>geometry_msgs/PoseWithCovariance</span>
            </button>
          </div>

          <div className={styles.pubSubDetail}>
            <div className={styles.pubControlsRow}>
              <div className={styles.controlField}>
                <label>Linear Velocity X: {linearX.toFixed(2)} m/s</label>
                <input
                  type="range"
                  min="-1.5"
                  max="1.5"
                  step="0.05"
                  value={linearX}
                  onChange={(e) => setLinearX(parseFloat(e.target.value))}
                  className={styles.sliderInput}
                />
              </div>

              <div className={styles.controlField}>
                <label>Angular Yaw Rate Z: {angularZ.toFixed(2)} rad/s</label>
                <input
                  type="range"
                  min="-2.0"
                  max="2.0"
                  step="0.05"
                  value={angularZ}
                  onChange={(e) => setAngularZ(parseFloat(e.target.value))}
                  className={styles.sliderInput}
                />
              </div>

              <div className={styles.controlField}>
                <label>Publish Rate: {pubRate} Hz</label>
                <select
                  value={pubRate}
                  onChange={(e) => setPubRate(parseInt(e.target.value))}
                  style={{
                    background: '#0f172a',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                  }}
                >
                  <option value={10}>10 Hz</option>
                  <option value={20}>20 Hz</option>
                  <option value={50}>50 Hz</option>
                </select>
              </div>

              <button onClick={handlePublishMessage} className={styles.actionPublishBtn}>
                <Send size={13} />
                <span>Publish Message</span>
              </button>
            </div>

            <div className={styles.yamlViewer}>
              {`# Active Payload (ROS 2 Humble / Jazzy)
topic: ${selectedPubTopic}
msg_type: geometry_msgs/msg/Twist
rate_hz: ${pubRate}
linear:
  x: ${linearX.toFixed(3)}
  y: 0.000
  z: 0.000
angular:
  x: 0.000
  y: 0.000
  z: ${angularZ.toFixed(3)}
qos_profile:
  reliability: RELIABLE
  durability: VOLATILE
  history: KEEP_LAST (depth: 10)`}
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          TAB 3: Topic Subscribers
          ======================================================= */}
      {activeTab === 'subscribers' && (
        <div className={styles.pubSubContainer}>
          <div className={styles.sideList}>
            <button
              className={`${styles.topicItemBtn} ${selectedSubTopic === '/odom' ? styles.activeTopicItem : ''}`}
              onClick={() => setSelectedSubTopic('/odom')}
            >
              <span className={styles.topicName}>/odom</span>
              <span className={styles.topicType}>nav_msgs/msg/Odometry (50Hz)</span>
            </button>
            <button
              className={`${styles.topicItemBtn} ${selectedSubTopic === '/mavros/state' ? styles.activeTopicItem : ''}`}
              onClick={() => setSelectedSubTopic('/mavros/state')}
            >
              <span className={styles.topicName}>/mavros/state</span>
              <span className={styles.topicType}>mavros_msgs/msg/State (10Hz)</span>
            </button>
            <button
              className={`${styles.topicItemBtn} ${selectedSubTopic === '/battery_state' ? styles.activeTopicItem : ''}`}
              onClick={() => setSelectedSubTopic('/battery_state')}
            >
              <span className={styles.topicName}>/battery_state</span>
              <span className={styles.topicType}>sensor_msgs/msg/BatteryState (1Hz)</span>
            </button>
          </div>

          <div className={styles.pubSubDetail}>
            <div className={styles.yamlViewer}>
              {selectedSubTopic === '/odom' &&
                `---
header:
  stamp: { sec: ${Math.floor(Date.now() / 1000)}, nanosec: 482190312 }
  frame_id: "odom"
child_frame_id: "base_footprint"
pose:
  pose:
    position: { x: ${liveOdom.x}, y: ${liveOdom.y}, z: ${liveOdom.z} }
    orientation: { heading: ${liveOdom.heading_deg} deg, qz: 0.384, qw: 0.923 }
twist:
  twist:
    linear: { x: ${liveOdom.linear_vel}, y: 0.00, z: 0.00 }
    angular: { x: 0.00, y: 0.00, z: ${liveOdom.angular_vel} }`}

              {selectedSubTopic === '/mavros/state' &&
                `---
header:
  stamp: { sec: ${Math.floor(Date.now() / 1000)}, nanosec: 120482931 }
  frame_id: "pixhawk_6x_base"
connected: true
armed: true
guided: true
manual_input: false
mode: "AUTO.MISSION"
system_status: 4 (MAV_STATE_ACTIVE)`}

              {selectedSubTopic === '/battery_state' &&
                `---
header:
  stamp: { sec: ${Math.floor(Date.now() / 1000)}, nanosec: 981245012 }
voltage: ${liveOdom.battery_v} V
current: -12.45 A
charge: 4.82 Ah
capacity: 5.20 Ah
design_capacity: 5.20 Ah
percentage: 92.4 %
power_supply_status: 2 (DISCHARGING)
cell_voltage: [4.10, 4.10, 4.10, 4.10] V`}
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          TAB 4: LiDAR Data Publishing & Navigation Session (/scan & Nav2)
          ======================================================= */}
      {activeTab === 'lidar_nav' && (
        <div className={styles.lidarSessionContainer}>
          {/* Live Polar Radar Sweep Canvas */}
          <div className={styles.radarHost}>
            <canvas ref={radarCanvasRef} width={270} height={270} className={styles.radarCanvas} />
          </div>

          {/* Nav2 & LiDAR Metadata Dashboard */}
          <div className={styles.nav2MetaPanel}>
            <div className={styles.nav2Header}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio size={14} color="#00e5ff" />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
                  /scan // sensor_msgs/LaserScan
                </span>
              </div>
              <span className={styles.nav2Badge}>ACTIVE (15.0 Hz)</span>
            </div>

            <div className={styles.specsGrid}>
              <div className={styles.specTile}>
                <span className={styles.specKey}>LIDAR RANGE</span>
                <span className={styles.specVal}>0.15m - 12.00m (360°)</span>
              </div>
              <div className={styles.specTile}>
                <span className={styles.specKey}>SCAN RATE</span>
                <span className={styles.specVal}>15.0 Hz (360 samples)</span>
              </div>
              <div className={styles.specTile}>
                <span className={styles.specKey}>CLOSEST OBSTACLE</span>
                <span className={styles.specVal} style={{ color: '#f59e0b' }}>0.82m @ 42°</span>
              </div>
              <div className={styles.specTile}>
                <span className={styles.specKey}>SLAM LOOP CLOSURE</span>
                <span className={styles.specVal}>Cartographer &lt; 0.018m</span>
              </div>
              <div className={styles.specTile}>
                <span className={styles.specKey}>NAV2 GLOBAL GOAL</span>
                <span className={styles.specVal}>[x: 4.82m, y: -2.15m]</span>
              </div>
              <div className={styles.specTile}>
                <span className={styles.specKey}>COSTMAP INFLATION</span>
                <span className={styles.specVal}>1.20m (DWB Controller)</span>
              </div>
            </div>

            <div className={styles.yamlViewer} style={{ maxHeight: '110px' }}>
              {`$ ros2 topic echo /scan --once
header: {stamp: {sec: 1718293044}, frame_id: "laser_link"}
angle_min: -3.14159 rad (-180.0°)
angle_max: 3.14159 rad (+180.0°)
angle_increment: 0.01745 rad (1.0°)
ranges: [1.42, 1.45, 1.41, 0.82, 0.78, 0.81, ... 360 values]
intensities: [180.0, 185.0, 179.0, ... 360 values]`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ROSTerminal;
