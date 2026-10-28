"use client";

import React, { useState } from 'react';
import { Cpu, Zap, RotateCw, ExternalLink } from 'lucide-react';
import { GithubIcon } from '@/components/Common/Icons';
import styles from './PCB3DFlipShowcase.module.css';

interface PCBProject {
  id: string;
  name: string;
  tagline: string;
  category: string;
  substrateColor: string;
  chip: string;
  busSpeed: string;
  voltage: string;
  pinout: { pin: string; function: string }[];
  overview: string;
  metrics: { label: string; value: string }[];
  liveUrl?: string;
  githubUrl?: string;
}

export const PCB3DFlipShowcase: React.FC = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('drone');

  const pcbProjects: PCBProject[] = [
    {
      id: 'drone',
      name: 'Pixhawk 6X Autonomous Companion Carrier PCB',
      tagline: 'Custom power distribution, telemetry bridge, and planar LiDAR companion computer interface.',
      category: 'Autonomous UAVs',
      substrateColor: 'matte-black',
      chip: 'STM32H753 + Jetson Companion',
      busSpeed: '480 MHz & 921,600 baud UART',
      voltage: '5.2V Regulated / 4S LiPo (16.8V)',
      pinout: [
        { pin: 'P1_UART7_TX', function: 'MAVROS Companion Link' },
        { pin: 'P2_I2C1_SDA', function: 'External Compass / Baro' },
        { pin: 'P3_CAN1_H', function: 'DroneCAN High-Speed ESC Bus' },
        { pin: 'P4_PWM_CH1-4', function: 'DShot600 Motor Actuation' },
      ],
      overview:
        'Engineered to eliminate wire harness failure in autonomous drone flight. Provides galvanic isolation, redundant 5V rail switching, and direct high-speed DMA bus communication with companion SBC running ROS 2 Humble.',
      metrics: [
        { label: 'Latency', value: '< 2.4 ms' },
        { label: 'Max Current', value: '60A Continuous' },
        { label: 'Layers', value: '4-Layer FR4 (2oz)' },
      ],
      liveUrl: 'https://drive.google.com/drive/folders/1b35zZf0s4gYqD80vH0wH53BfB7yW9f7z',
      githubUrl: 'https://github.com/samptec',
    },
    {
      id: 'robogleam',
      name: 'RoboGleam Dual-Arm BLDC Actuation Motherboard',
      tagline: 'High-torque BLDC motor control harness and articulated cleaning arm servo subsystem.',
      category: 'IEEE ICCCNT 2024 Author',
      substrateColor: 'emerald',
      chip: 'ATmega2560 + DRV8302 Drivers',
      busSpeed: '16 MHz System Clock',
      voltage: '24V Motor / 5V Logic Rail',
      pinout: [
        { pin: 'J1_BLDC_PWM1-3', function: '3-Phase Space Vector PWM' },
        { pin: 'J2_ENCODER_ABZ', function: 'Optical Quadrature Feedback' },
        { pin: 'J3_BLE_RX/TX', function: 'Mobile Command Telemetry' },
        { pin: 'J4_ADC_CURRENT', function: 'Overcurrent Shunt Sensing' },
      ],
      overview:
        'Custom PCB harness supporting dual cleaning arm linkages published at IEEE ICCCNT 2024. Features active thermal copper planes, snubber circuits for inductive spike suppression, and optoisolated MOSFET gates.',
      metrics: [
        { label: 'Torque Rating', value: '4.8 Nm per Joint' },
        { label: 'Operating Temp', value: '-10°C to +75°C' },
        { label: 'Isolation', value: '2.5 kV RMS' },
      ],
      liveUrl: 'https://drive.google.com/drive/folders/1b35zZf0s4gYqD80vH0wH53BfB7yW9f7z',
      githubUrl: 'https://github.com/samptec',
    },
    {
      id: 'vision',
      name: 'Edge Vision Jetson TX2 Carrier Subsystem',
      tagline: 'High-throughput MIPI CSI-2 & Gigabit Ethernet gateway for warehouse automated quality inspection.',
      category: 'AI & Computer Vision',
      substrateColor: 'midnight-blue',
      chip: 'NVIDIA Jetson TX2 Pascal GPU',
      busSpeed: '1.3 GHz & 4-Lane MIPI',
      voltage: '12V DC Input / 3.3V Logic',
      pinout: [
        { pin: 'CSI_LANE0-3', function: 'Sony IMX477 4K Sensor Bus' },
        { pin: 'ETH_GBE_MDI', function: 'Industrial Modbus / TCP-IP' },
        { pin: 'GPIO_TRIGGER', function: 'Sync Hardware Strobe LED' },
        { pin: 'I2C_EEPROM', function: 'Calibration Matrix Store' },
      ],
      overview:
        'Fabricated for Flipkart GRID 6.0 national engineering competition. Synchronizes high-speed camera exposure triggers with edge neural network inference to classify SKU packages and extract OCR expiry dates at 60 FPS.',
      metrics: [
        { label: 'Inference', value: '18 ms / Frame' },
        { label: 'Resolution', value: '3840 x 2160' },
        { label: 'Accuracy', value: '99.4% SKU Match' },
      ],
      liveUrl: 'https://drive.google.com/drive/folders/1b35zZf0s4gYqD80vH0wH53BfB7yW9f7z',
      githubUrl: 'https://github.com/samptec',
    },
    {
      id: 'iot',
      name: 'Wireless IoT Biosensor & LoRa Gateway Node',
      tagline: 'Ultra-low power telemetry board transmitting heart rate, SPO2, and patient biosensors over 5km.',
      category: 'Embedded IoT',
      substrateColor: 'deep-purple',
      chip: 'ESP32-S3 + Semtech SX1262 LoRa',
      busSpeed: '240 MHz Dual-Core',
      voltage: '3.7V Li-Po / Solar Harvester',
      pinout: [
        { pin: 'SPI_MOSI/MISO', function: 'SX1262 LoRaWAN Radio' },
        { pin: 'I2C_MAX30102', function: 'Optical Pulse Oximeter' },
        { pin: 'ADC_ECG_LEAD', function: 'AD8232 Biosensor Lead' },
        { pin: 'GPIO_WAKEUP', function: 'Ultra Low Power Deep Sleep' },
      ],
      overview:
        'Designed for remote health monitoring and emergency telemetry. Uses power gating to operate in sleep mode (< 15 µA) and broadcasts encrypted sensor packets across long-range LoRaWAN frequencies with BLE fallback.',
      metrics: [
        { label: 'Range', value: '> 5.2 km Line of Sight' },
        { label: 'Sleep Current', value: '14.2 µA' },
        { label: 'Battery Life', value: '180+ Days on 1200mAh' },
      ],
      liveUrl: 'https://drive.google.com/drive/folders/1b35zZf0s4gYqD80vH0wH53BfB7yW9f7z',
      githubUrl: 'https://github.com/samptec',
    },
  ];

  const currentProject = pcbProjects.find((p) => p.id === selectedProjectId) || pcbProjects[0];

  return (
    <div className={styles.flipSectionContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.headerTag}>
          <Zap size={14} className={styles.zapIcon} />
          <span>3D HARDWARE ARCHITECTURE &amp; FLIP INSPECTION</span>
        </div>
        <h2 className={styles.mainTitle}>
          PCB Motherboard &amp; <span className="gradient-text">Circuit Digital Twin</span>
        </h2>
        <p className={styles.subtitle}>
          Interactive 3D PCB board with realistic trace topology, active SMT LEDs, and double-sided schematic flip.
        </p>

        {/* Project Selector Pills */}
        <div className={styles.projectPills}>
          {pcbProjects.map((proj) => (
            <button
              key={proj.id}
              className={`${styles.pillBtn} ${selectedProjectId === proj.id ? styles.activePillBtn : ''}`}
              onClick={() => {
                setSelectedProjectId(proj.id);
                // Trigger subtle flip recoil
                setIsFlipped(false);
              }}
            >
              <Cpu size={14} />
              <span>{proj.name.split(' ')[0]} {proj.name.split(' ')[1]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3D Flip Card Viewport */}
      <div className={styles.flipPerspectiveStage}>
        <div className={`${styles.flipCard} ${isFlipped ? styles.isFlipped : ''}`}>
          {/* =========================================
              FRONT SIDE: Realistic 3D PCB Component Layout
              ========================================= */}
          <div className={`${styles.cardFace} ${styles.cardFront} ${styles[currentProject.substrateColor]}`}>
            {/* Corner Mount Holes */}
            <span className={`${styles.mountHole} ${styles.holeTL}`} />
            <span className={`${styles.mountHole} ${styles.holeTR}`} />
            <span className={`${styles.mountHole} ${styles.holeBL}`} />
            <span className={`${styles.mountHole} ${styles.holeBR}`} />

            {/* Silk Screen Header */}
            <div className={styles.silkHeader}>
              <div className={styles.silkLogo}>
                <span className={styles.silkBrand}>SAMARTHA S // HW LABS</span>
                <span className={styles.silkRev}>REV 2.4B</span>
              </div>
              <div className={styles.silkCategory}>{currentProject.category}</div>
            </div>

            {/* Central Microcontroller QFP / BGA Chip */}
            <div className={styles.mcuPackage}>
              <div className={styles.silkscreenBorder} />
              <div className={styles.chipBody}>
                <span className={styles.chipPin1Dot} />
                <span className={styles.chipBrand}>{currentProject.chip.split(' ')[0]}</span>
                <span className={styles.chipModel}>{currentProject.chip}</span>
                <span className={styles.chipClock}>{currentProject.busSpeed}</span>
              </div>
              {/* Surrounding Gold Chip Pins */}
              <div className={styles.chipPinsTop} />
              <div className={styles.chipPinsBottom} />
              <div className={styles.chipPinsLeft} />
              <div className={styles.chipPinsRight} />
            </div>

            {/* Circuit SMT Traces & LEDs */}
            <div className={styles.tracesDecoration}>
              <div className={styles.traceLine1} />
              <div className={styles.traceLine2} />
              <div className={styles.traceLine3} />

              {/* Pulsing SMT Status LEDs */}
              <div className={styles.ledCluster}>
                <div className={styles.ledItem}>
                  <span className={`${styles.smtLed} ${styles.ledGreen}`} />
                  <span className={styles.ledLabel}>PWR 3V3</span>
                </div>
                <div className={styles.ledItem}>
                  <span className={`${styles.smtLed} ${styles.ledBlue}`} />
                  <span className={styles.ledLabel}>DMA RX/TX</span>
                </div>
                <div className={styles.ledItem}>
                  <span className={`${styles.smtLed} ${styles.ledAmber}`} />
                  <span className={styles.ledLabel}>STATUS</span>
                </div>
              </div>
            </div>

            {/* Front Card Footer Bar */}
            <div className={styles.frontFooter}>
              <div className={styles.projNameBadge}>
                <span className={styles.projTitleText}>{currentProject.name}</span>
                <span className={styles.projVoltage}>{currentProject.voltage}</span>
              </div>

              <button
                onClick={() => setIsFlipped(true)}
                className={styles.flipActionBtn}
                title="Flip to inspect technical pinout and system architecture"
              >
                <RotateCw size={14} className={styles.flipIcon} />
                <span>FLIP TO SCHEMATICS</span>
              </button>
            </div>
          </div>

          {/* =========================================
              BACK SIDE: Engineering Schematics & Architecture
              ========================================= */}
          <div className={`${styles.cardFace} ${styles.cardBack}`}>
            {/* Tech Corner Accents */}
            <span className={styles.techCornerTL} />
            <span className={styles.techCornerTR} />
            <span className={styles.techCornerBL} />
            <span className={styles.techCornerBR} />

            <div className={styles.backHeader}>
              <div className={styles.backTitleRow}>
                <span className={styles.backCategoryTag}>ARCHITECTURE &amp; PINOUT</span>
                <h3 className={styles.backTitle}>{currentProject.name}</h3>
              </div>
              <button
                onClick={() => setIsFlipped(false)}
                className={styles.backFlipBtn}
                title="Flip back to front 3D circuit board"
              >
                <RotateCw size={13} />
                <span>FRONT VIEW</span>
              </button>
            </div>

            <p className={styles.backOverview}>{currentProject.overview}</p>

            {/* Pinout Signal Routing Grid */}
            <div className={styles.pinoutSection}>
              <div className={styles.pinoutHeader}>HIGH-SPEED BUS SIGNAL MAPPING</div>
              <div className={styles.pinoutGrid}>
                {currentProject.pinout.map((pin, pIdx) => (
                  <div key={pIdx} className={styles.pinRow}>
                    <span className={styles.pinName}>{pin.pin}</span>
                    <span className={styles.pinArrow}>→</span>
                    <span className={styles.pinFunc}>{pin.function}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hardware Metrics Strip */}
            <div className={styles.metricsRow}>
              {currentProject.metrics.map((m, mIdx) => (
                <div key={mIdx} className={styles.metricBox}>
                  <span className={styles.mLabel}>{m.label}</span>
                  <span className={styles.mValue}>{m.value}</span>
                </div>
              ))}
            </div>

            {/* External Links Cluster */}
            <div className={styles.backFooterLinks}>
              {currentProject.liveUrl && (
                <a
                  href={currentProject.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.docLink}
                >
                  <ExternalLink size={14} />
                  <span>Google Drive Design Files</span>
                </a>
              )}
              {currentProject.githubUrl && (
                <a
                  href={currentProject.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.docLink}
                >
                  <GithubIcon size={14} />
                  <span>Firmware Repo</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PCB3DFlipShowcase;
