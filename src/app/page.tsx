"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import {
  personalInfo,
  projects,
  publications,
  workExperience,
  skillCategories,
  Project,
} from '@/lib/portfolioData';
import RoboticsCanvas from '@/components/Common/RoboticsCanvas';
import ProjectModal from '@/components/Common/ProjectModal';
import InfiniteTicker from '@/components/Common/InfiniteTicker';
import Card3DTilt from '@/components/Spatial/Card3DTilt';
import BorderBeam from '@/components/Spatial/BorderBeam';
import Robotics3DScene from '@/components/3D/Robotics3DScene';
import PCBCircuitBoard from '@/components/3D/PCBCircuitBoard';
import CADBlueprintViewer from '@/components/Robotics/CADBlueprintViewer';
import ROSTerminal from '@/components/Robotics/ROSTerminal';
import VisualServoingSimulator from '@/components/Robotics/VisualServoingSimulator';
import { GithubIcon } from '@/components/Common/Icons';
import {
  Bot,
  Cpu,
  Radio,
  Layers,
  ArrowRight,
  FileDown,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  Mail,
  Phone,
  Award,
  Terminal,
  ChevronRight,
  Search,
  Sparkles,
  Zap,
  Compass,
  Crosshair,
} from 'lucide-react';
import styles from './Home.module.css';

export default function HomePage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeSkillTab, setActiveSkillTab] = useState<string>(skillCategories[0].name);
  const [activeLabTab, setActiveLabTab] = useState<'3d' | 'vss' | 'pcb' | 'catia' | 'ros'>('3d');
  const [skillSearch, setSkillSearch] = useState<string>('');
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [copiedBibtex, setCopiedBibtex] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const categories = ['All', 'Robotics & ROS', 'Drones & UAVs', 'AI & CV', 'Embedded & IoT'];

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'All') return projects;
    return projects.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const activeCategorySkills = useMemo(() => {
    const cat = skillCategories.find((c) => c.name === activeSkillTab);
    if (!cat) return [];
    if (!skillSearch.trim()) return cat.skills;
    return cat.skills.filter(
      (s) =>
        s.name.toLowerCase().includes(skillSearch.toLowerCase()) ||
        s.tags?.some((t) => t.toLowerCase().includes(skillSearch.toLowerCase()))
    );
  }, [activeSkillTab, skillSearch]);

  const handleDownloadCv = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#00e5ff', '#3b82f6', '#8b5cf6', '#10b981'],
    });
  };

  const copyToClipboard = (text: string, type: 'citation' | 'bibtex' | 'email' | 'phone') => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (type === 'citation') {
        setCopiedCitation(true);
        setTimeout(() => setCopiedCitation(false), 2000);
      } else if (type === 'bibtex') {
        setCopiedBibtex(true);
        setTimeout(() => setCopiedBibtex(false), 2000);
      } else if (type === 'email') {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      } else if (type === 'phone') {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
      }
    }
  };

  return (
    <div className={styles.homeWrapper}>
      {/* Interactive Background */}
      <RoboticsCanvas />

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={`container ${styles.heroContainer}`}>
          {/* Hero Left Content */}
          <div className={styles.heroContent}>
            {/* Status Pill */}
            <div className="status-pill">
              <span className="pulse-dot" />
              <span>Available for Robotics &amp; Autonomous Systems Engineering</span>
            </div>

            {/* Main Headline */}
            <div className={styles.titleGroup}>
              <span className={styles.greeting}>Hello, I&apos;m</span>
              <h1 className={styles.heroName}>
                {personalInfo.name}
              </h1>
              <h2 className={styles.heroRole}>
                <span className="gradient-text">{personalInfo.title}</span>
              </h2>
            </div>

            {/* Subheadline / Bio */}
            <p className={styles.heroBio}>
              Specializing in <strong className={styles.highlightText}>ROS/ROS 2</strong>, autonomous drone &amp; ground navigation, computer vision, and embedded hardware. 
              <span className={styles.accentBadge}> 5,000+ engineers mentored</span> and <span className={styles.accentBadge}>IEEE published author</span>.
            </p>

            {/* Quick Telemetry Chips */}
            <div className={styles.telemetryStrip}>
              <span className={styles.telemetryTag}>
                <Bot size={13} /> ROS 2 (Humble / Jazzy)
              </span>
              <span className={styles.telemetryTag}>
                <Radio size={13} /> MAVROS &amp; PX4 Autonomy
              </span>
              <span className={styles.telemetryTag}>
                <Cpu size={13} /> SLAM &amp; Nav2
              </span>
              <span className={styles.telemetryTag}>
                <Layers size={13} /> TensorFlow &amp; OpenCV
              </span>
            </div>

            {/* Call-to-Action Buttons */}
            <div className={styles.heroActions}>
              <a href="#lab" className="btn-primary">
                <Sparkles size={16} />
                <span>Launch 3D Lab</span>
              </a>

              <a href="#projects" className="btn-secondary">
                <span>Explore Innovations</span>
                <ArrowRight size={17} />
              </a>

              <a
                href={personalInfo.resumePdf}
                download="SamarthaS_CV.pdf"
                onClick={handleDownloadCv}
                className={styles.downloadCvBtn}
              >
                <FileDown size={17} />
                <span>Download CV</span>
              </a>
            </div>

            {/* Contact Micro-row */}
            <div className={styles.heroContactRow}>
              <button
                onClick={() => copyToClipboard(personalInfo.email, 'email')}
                className={styles.quickCopyBtn}
                title="Click to copy email"
              >
                <Mail size={14} />
                <span>{personalInfo.email}</span>
                {copiedEmail ? <Check size={13} className={styles.copySuccess} /> : <Copy size={13} />}
              </button>

              <button
                onClick={() => copyToClipboard(personalInfo.phone, 'phone')}
                className={styles.quickCopyBtn}
                title="Click to copy phone"
              >
                <Phone size={14} />
                <span>{personalInfo.phone}</span>
                {copiedPhone ? <Check size={13} className={styles.copySuccess} /> : <Copy size={13} />}
              </button>
            </div>
          </div>

          {/* Hero Right Visual: Holographic HUD Portrait */}
          <div className={styles.heroVisualCol}>
            <Card3DTilt intensity={14}>
              <div className={styles.hudCard}>
                <BorderBeam size={180} duration={7} />

                {/* Outer Orbit Rings */}
                <div className={styles.hudRing1} />
                <div className={styles.hudRing2} />

                {/* Holographic Portrait Container */}
                <div className={styles.portraitWrapper}>
                  <div className={styles.portraitGlow} />
                  <Image
                    src="/samartha.png"
                    alt="Samartha S - Robotics & AI Engineer"
                    width={310}
                    height={310}
                    priority
                    className={styles.portraitImage}
                  />

                  {/* Floating Status Badges */}
                  <div className={`${styles.floatingHUD} ${styles.hudTopRight}`}>
                    <span className={styles.hudDot} />
                    <span className={styles.hudText}>Autonomous Flight Active</span>
                  </div>

                  <div className={`${styles.floatingHUD} ${styles.hudBottomLeft}`}>
                    <Terminal size={12} />
                    <span className={styles.hudText}>ROS2 / LiDAR Fused</span>
                  </div>
                </div>

                {/* Telemetry Strip Under Portrait */}
                <div className={styles.hudTelemetryBar}>
                  <div className={styles.telemetryItem}>
                    <span className={styles.telLabel}>SYS STATE</span>
                    <span className={styles.telValue}>READY</span>
                  </div>
                  <div className={styles.telemetryDivider} />
                  <div className={styles.telemetryItem}>
                    <span className={styles.telLabel}>LOCATION</span>
                    <span className={styles.telValue}>Bengaluru, IN</span>
                  </div>
                  <div className={styles.telemetryDivider} />
                  <div className={styles.telemetryItem}>
                    <span className={styles.telLabel}>RESEARCH</span>
                    <span className={styles.telValue}>IEEE ICCCNT</span>
                  </div>
                </div>
              </div>
            </Card3DTilt>
          </div>
        </div>
      </section>

      {/* Infinite Aceternity Telemetry Marquee Ticker */}
      <InfiniteTicker />

      {/* Key Engineering Metrics Strip */}
      <section className={styles.metricsSection}>
        <div className={`container ${styles.metricsGrid}`}>
          {personalInfo.stats.map((stat, idx) => (
            <Card3DTilt key={idx} intensity={10}>
              <div className={`glass-panel ${styles.metricCard}`}>
                <div className={styles.metricValue}>{stat.value}</div>
                <div className={styles.metricLabel}>{stat.label}</div>
                <div className={styles.metricDetail}>{stat.detail}</div>
              </div>
            </Card3DTilt>
          ))}
        </div>
      </section>

      {/* 3D ROBOTICS & VIBE CODING WORKSTATION LAB */}
      <section id="lab" className={`section-padding ${styles.labSection}`}>
        <div className="container">
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.sectionEyebrow}>INTERACTIVE 3D &amp; HARDWARE WORKBENCH</span>
            <h2 className={styles.sectionHeading}>
              Robotics, PCB &amp; <span className="gradient-text">CAD Digital Twins</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              Interact live with full 3D WebGL kinematic arms, circuit PCB data currents, CATIA aerospace wireframes, and active ROS 2 telemetry.
            </p>

            {/* Workbench Tab Switcher */}
            <div className={styles.labNavPills}>
              <button
                className={`${styles.labTabBtn} ${activeLabTab === '3d' ? styles.activeLabBtn : ''}`}
                onClick={() => setActiveLabTab('3d')}
              >
                <Bot size={15} />
                <span>3D Kinematic Twin</span>
              </button>
              <button
                className={`${styles.labTabBtn} ${activeLabTab === 'vss' ? styles.activeLabBtn : ''}`}
                onClick={() => setActiveLabTab('vss')}
              >
                <Crosshair size={15} />
                <span>Visual Servoing (VSS)</span>
              </button>
              <button
                className={`${styles.labTabBtn} ${activeLabTab === 'pcb' ? styles.activeLabBtn : ''}`}
                onClick={() => setActiveLabTab('pcb')}
              >
                <Zap size={15} />
                <span>High-Speed PCB Circuit</span>
              </button>
              <button
                className={`${styles.labTabBtn} ${activeLabTab === 'catia' ? styles.activeLabBtn : ''}`}
                onClick={() => setActiveLabTab('catia')}
              >
                <Compass size={15} />
                <span>CATIA 3D Blueprint</span>
              </button>
              <button
                className={`${styles.labTabBtn} ${activeLabTab === 'ros' ? styles.activeLabBtn : ''}`}
                onClick={() => setActiveLabTab('ros')}
              >
                <Terminal size={15} />
                <span>Live ROS 2 Terminal</span>
              </button>
            </div>
          </div>

          {/* Workbench Active Viewport */}
          <div className={styles.labViewport}>
            {activeLabTab === '3d' && <Robotics3DScene />}
            {activeLabTab === 'vss' && <VisualServoingSimulator />}
            {activeLabTab === 'pcb' && <PCBCircuitBoard />}
            {activeLabTab === 'catia' && <CADBlueprintViewer />}
            {activeLabTab === 'ros' && <ROSTerminal />}
          </div>
        </div>
      </section>

      {/* Engineering Pillars (What I Build) with 3D Spatial Tilt */}
      <section className={`section-padding ${styles.pillarsSection}`}>
        <div className="container">
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.sectionEyebrow}>CORE COMPETENCIES</span>
            <h2 className={styles.sectionHeading}>
              Engineering the Future of <span className="gradient-text">Intelligent Machines</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              From physical kinematic design and circuit fab to real-time ROS 2 navigation and deep learning perception models.
            </p>
          </div>

          <div className={styles.pillarsGrid}>
            <Card3DTilt intensity={12}>
              <div className={`glass-panel ${styles.pillarCard}`}>
                <BorderBeam size={120} duration={8} />
                <div className={styles.pillarIconBox}>
                  <Bot size={26} />
                </div>
                <h3 className={styles.pillarTitle}>Autonomous Mobile Robots &amp; ROS 2</h3>
                <p className={styles.pillarDesc}>
                  Architecting ground robots using ROS 1, ROS 2 (Humble/Jazzy), Nav2, Cartographer SLAM, and costmap optimization. Tested under dynamic load and payload stress.
                </p>
                <ul className={styles.pillarList}>
                  <li><CheckCircle2 size={14} /> Industrial AMR product design</li>
                  <li><CheckCircle2 size={14} /> LiDAR 2D/3D sensor mapping &amp; path planning</li>
                  <li><CheckCircle2 size={14} /> Obstacle avoidance &amp; dynamic routing</li>
                </ul>
              </div>
            </Card3DTilt>

            <Card3DTilt intensity={12}>
              <div className={`glass-panel ${styles.pillarCard}`}>
                <BorderBeam size={120} duration={9} colorFrom="#3b82f6" colorTo="#8b5cf6" />
                <div className={styles.pillarIconBox}>
                  <Radio size={26} />
                </div>
                <h3 className={styles.pillarTitle}>Autonomous Flight &amp; MAVROS</h3>
                <p className={styles.pillarDesc}>
                  Engineering companion computer autonomy on Pixhawk quadcopters. Implementing MAVROS telemetry, PX4 flight stack, and GPS-denied indoor waypoint tracking.
                </p>
                <ul className={styles.pillarList}>
                  <li><CheckCircle2 size={14} /> Planar LiDAR altitude &amp; range fusion</li>
                  <li><CheckCircle2 size={14} /> High-speed telemetry transmission to GCS</li>
                  <li><CheckCircle2 size={14} /> Full hardware harness assembly &amp; PID tuning</li>
                </ul>
              </div>
            </Card3DTilt>

            <Card3DTilt intensity={12}>
              <div className={`glass-panel ${styles.pillarCard}`}>
                <BorderBeam size={120} duration={7} colorFrom="#8b5cf6" colorTo="#10b981" />
                <div className={styles.pillarIconBox}>
                  <Cpu size={26} />
                </div>
                <h3 className={styles.pillarTitle}>Computer Vision &amp; Applied AI</h3>
                <p className={styles.pillarDesc}>
                  Developing neural vision pipelines for warehouse quality inspection, OCR date/pricing extraction, and real-time facial recognition authentication.
                </p>
                <ul className={styles.pillarList}>
                  <li><CheckCircle2 size={14} /> Deep learning SKU sorting (Flipkart Grid 2024)</li>
                  <li><CheckCircle2 size={14} /> OpenCV contour &amp; feature matching</li>
                  <li><CheckCircle2 size={14} /> Voice AI and biometric facial verification</li>
                </ul>
              </div>
            </Card3DTilt>

            <Card3DTilt intensity={12}>
              <div className={`glass-panel ${styles.pillarCard}`}>
                <BorderBeam size={120} duration={10} colorFrom="#10b981" colorTo="#00e5ff" />
                <div className={styles.pillarIconBox}>
                  <Layers size={26} />
                </div>
                <h3 className={styles.pillarTitle}>Embedded IoT &amp; Rapid Prototyping</h3>
                <p className={styles.pillarDesc}>
                  Crafting custom IoT microcontroller boards (ESP32, Raspberry Pi, Arduino Mega), power regulation circuits in KiCad, and 3D mechanical enclosures in CATIA.
                </p>
                <ul className={styles.pillarList}>
                  <li><CheckCircle2 size={14} /> Critical biosensor telemetry (ECG/BPM/BP)</li>
                  <li><CheckCircle2 size={14} /> Precision aerospace CAD modeling (GSLV Mk II)</li>
                  <li><CheckCircle2 size={14} /> Environmental climate &amp; smart irrigation systems</li>
                </ul>
              </div>
            </Card3DTilt>
          </div>
        </div>
      </section>

      {/* Featured Projects Showcase with 3D Spatial Tilt */}
      <section id="projects" className={`section-padding ${styles.projectsSection}`}>
        <div className="container">
          <div className={styles.sectionHeaderFlex}>
            <div>
              <span className={styles.sectionEyebrow}>PORTFOLIO OF INNOVATIONS</span>
              <h2 className={styles.sectionHeading}>
                Featured Engineering <span className="gradient-text">Projects</span>
              </h2>
              <p className={styles.sectionSubtitle}>
                Select autonomous systems, robotics hardware, AI vision models, and aerospace designs.
              </p>
            </div>

            <Link href="/projects" className={styles.viewAllBtn}>
              <span>View All 10 Projects</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          {/* Category Filter Pills */}
          <div className={styles.filterPillGroup}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`${styles.filterPill} ${activeCategory === cat ? styles.filterPillActive : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Projects Grid */}
          <div className={styles.projectsGrid}>
            {filteredProjects.map((project) => (
              <Card3DTilt key={project.slug} intensity={10}>
                <div className={`glass-panel ${styles.projectCard}`}>
                  <div className={styles.projectHeader}>
                    <span className={styles.projectCategory}>{project.category}</span>
                    {project.date && <span className={styles.projectDate}>{project.date}</span>}
                  </div>

                  <h3 className={styles.projectTitle}>{project.title}</h3>
                  <p className={styles.projectTagline}>{project.tagline}</p>

                  <p className={styles.projectDesc}>{project.description}</p>

                  {/* Tech Chips */}
                  <div className={styles.projectTechGrid}>
                    {project.techStack.slice(0, 5).map((tech) => (
                      <span key={tech} className="tech-chip">
                        {tech}
                      </span>
                    ))}
                    {project.techStack.length > 5 && (
                      <span className="tech-chip">+{project.techStack.length - 5} more</span>
                    )}
                  </div>

                  {/* Project Card Footer */}
                  <div className={styles.projectFooter}>
                    <button
                      onClick={() => setSelectedProject(project)}
                      className={styles.inspectBtn}
                    >
                      <span>System Specs</span>
                      <ArrowRight size={14} />
                    </button>

                    <div className={styles.projectExternalLinks}>
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.extIconLink}
                          title="View Demo / Google Drive"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.extIconLink}
                          title="GitHub Repository"
                        >
                          <GithubIcon size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Card3DTilt>
            ))}
          </div>
        </div>
      </section>

      {/* IEEE Publication Feature Section */}
      <section id="publication" className={`section-padding ${styles.publicationSection}`}>
        <div className="container">
          <Card3DTilt intensity={8}>
            <div className={`glass-panel ${styles.publicationBanner}`}>
              <BorderBeam size={220} duration={12} />
              <div className={styles.pubBadgeRow}>
                <span className={styles.pubBadge}>
                  <Award size={15} /> IEEE ICCCNT 2024 CONFERENCE PROCEEDINGS
                </span>
                <span className={styles.pubYear}>Published Research</span>
              </div>

              <div className={styles.pubContentGrid}>
                <div className={styles.pubMain}>
                  <h2 className={styles.pubTitle}>
                    {publications[0].title}
                  </h2>

                  <div className={styles.pubMeta}>
                    <div className={styles.metaItem}>
                      <strong>Authors:</strong> {publications[0].authors.join(', ')}
                    </div>
                    <div className={styles.metaItem}>
                      <strong>Conference:</strong> {publications[0].journal} ({publications[0].pages})
                    </div>
                    <div className={styles.metaItem}>
                      <strong>Publisher:</strong> {publications[0].publisher}
                    </div>
                  </div>

                  <p className={styles.pubAbstract}>
                    {publications[0].abstract}
                  </p>

                  <div className={styles.pubActionRow}>
                    <a
                      href={publications[0].link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                    >
                      <span>View IEEE Paper &amp; Drive Files</span>
                      <ExternalLink size={16} />
                    </a>

                    <button
                      onClick={() => copyToClipboard(publications[0].citation, 'citation')}
                      className="btn-secondary"
                    >
                      {copiedCitation ? <Check size={16} /> : <Copy size={16} />}
                      <span>{copiedCitation ? 'Citation Copied!' : 'Copy IEEE Citation'}</span>
                    </button>

                    <button
                      onClick={() => copyToClipboard(publications[0].bibtex, 'bibtex')}
                      className="btn-ghost"
                    >
                      {copiedBibtex ? <Check size={16} /> : <Copy size={16} />}
                      <span>{copiedBibtex ? 'BibTeX Copied!' : 'Copy BibTeX'}</span>
                    </button>
                  </div>
                </div>

                {/* Publication Specs Card */}
                <div className={styles.pubSpecsCard}>
                  <h4 className={styles.specsHeading}>Robotic System Highlights</h4>
                  <div className={styles.specsList}>
                    <div className={styles.specRow}>
                      <span className={styles.specLabel}>Drive System</span>
                      <span className={styles.specVal}>High-torque BLDC Motors</span>
                    </div>
                    <div className={styles.specRow}>
                      <span className={styles.specLabel}>Microcontroller</span>
                      <span className={styles.specVal}>Arduino Mega 2560</span>
                    </div>
                    <div className={styles.specRow}>
                      <span className={styles.specLabel}>Telemetry</span>
                      <span className={styles.specVal}>Bluetooth Low Energy App</span>
                    </div>
                    <div className={styles.specRow}>
                      <span className={styles.specLabel}>Mechanisms</span>
                      <span className={styles.specVal}>Dual Articulated Dusting &amp; Mop Arms</span>
                    </div>
                    <div className={styles.specRow}>
                      <span className={styles.specLabel}>Application</span>
                      <span className={styles.specVal}>Indoor &amp; Outdoor Commercial Floors</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card3DTilt>
        </div>
      </section>

      {/* Interactive Skills Matrix */}
      <section className={`section-padding ${styles.skillsSection}`}>
        <div className="container">
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.sectionEyebrow}>TECHNICAL PROFICIENCY</span>
            <h2 className={styles.sectionHeading}>
              Engineering <span className="gradient-text">Skill Matrix</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              Hands-on mastery across robotics stacks, autonomous flight control, embedded Linux, neural networks, and CAD drafting.
            </p>
          </div>

          <div className={`glass-panel ${styles.skillsContainer}`}>
            {/* Tab Selectors & Search */}
            <div className={styles.skillsNavRow}>
              <div className={styles.skillTabs}>
                {skillCategories.map((cat) => (
                  <button
                    key={cat.name}
                    className={`${styles.skillTabBtn} ${activeSkillTab === cat.name ? styles.skillTabBtnActive : ''}`}
                    onClick={() => setActiveSkillTab(cat.name)}
                  >
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>

              <div className={styles.searchBox}>
                <Search size={15} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Filter skills (e.g. ROS, C++, LiDAR)..."
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </div>

            {/* Skills Display Grid */}
            <div className={styles.skillsListGrid}>
              {activeCategorySkills.length > 0 ? (
                activeCategorySkills.map((skill) => (
                  <div key={skill.name} className={styles.skillRowCard}>
                    <div className={styles.skillInfoRow}>
                      <span className={styles.skillName}>{skill.name}</span>
                      <span className={styles.skillPercent}>{skill.level}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className={styles.skillTrack}>
                      <div
                        className={styles.skillFill}
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>

                    {skill.tags && (
                      <div className={styles.skillTagRow}>
                        {skill.tags.map((t) => (
                          <span key={t} className={styles.microTag}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className={styles.noSkillsFound}>
                  No skills matched &quot;{skillSearch}&quot;. Try searching for another keyword.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Career & Research Highlights */}
      <section className={`section-padding ${styles.experienceSection}`}>
        <div className="container">
          <div className={styles.sectionHeaderFlex}>
            <div>
              <span className={styles.sectionEyebrow}>PROFESSIONAL EXPERIENCE</span>
              <h2 className={styles.sectionHeading}>
                Career &amp; <span className="gradient-text">Research Journey</span>
              </h2>
              <p className={styles.sectionSubtitle}>
                Demonstrated record in research labs, autonomous mobile robotics, and engineering leadership.
              </p>
            </div>

            <Link href="/about" className={styles.viewAllBtn}>
              <span>Read Full Journey</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className={styles.timelineList}>
            {workExperience.slice(0, 3).map((job, idx) => (
              <Card3DTilt key={idx} intensity={8}>
                <div className={`glass-panel ${styles.timelineCard}`}>
                  <div className={styles.timelineHeader}>
                    <div className={styles.roleCol}>
                      <span className={styles.jobTypeBadge}>{job.type}</span>
                      <h3 className={styles.jobRole}>{job.role}</h3>
                      <h4 className={styles.jobCompany}>{job.company}</h4>
                    </div>
                    <div className={styles.periodCol}>
                      <span className={styles.jobPeriod}>{job.period}</span>
                      <span className={styles.jobLocation}>{job.location}</span>
                    </div>
                  </div>

                  <p className={styles.jobDesc}>{job.description}</p>

                  <ul className={styles.jobHighlights}>
                    {job.highlights.map((item, hIdx) => (
                      <li key={hIdx}>
                        <CheckCircle2 size={15} className={styles.bulletIcon} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  {job.link && (
                    <div className={styles.jobLinkRow}>
                      <a
                        href={job.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.jobDocLink}
                      >
                        <ExternalLink size={14} />
                        <span>View Research Association Credentials</span>
                      </a>
                    </div>
                  )}
                </div>
              </Card3DTilt>
            ))}
          </div>
        </div>
      </section>

      {/* Direct Contact Callout Banner */}
      <section className={`section-padding ${styles.ctaBannerSection}`}>
        <div className="container">
          <Card3DTilt intensity={6}>
            <div className={`glass-panel ${styles.ctaCard}`}>
              <BorderBeam size={200} duration={10} />
              <div className={styles.ctaCardContent}>
                <span className="status-pill">
                  <span className="pulse-dot" />
                  <span>Ready for Next-Gen Robotics Challenges</span>
                </span>

                <h2 className={styles.ctaTitle}>
                  Let&apos;s Build the Next Generation of <span className="gradient-text">Intelligent Robotics</span>
                </h2>

                <p className={styles.ctaDesc}>
                  Whether you need an autonomous navigation system, drone computer vision, or embedded IoT architecture, I am open to discussing engineering opportunities, research collaborations, and technical advisory.
                </p>

                <div className={styles.ctaButtonCluster}>
                  <Link href="/contact" className="btn-primary">
                    <span>Send a Message</span>
                    <ArrowRight size={17} />
                  </Link>

                  <a href={`mailto:${personalInfo.email}`} className="btn-secondary">
                    <Mail size={17} />
                    <span>Email Directly</span>
                  </a>

                  <a href={`tel:${personalInfo.phone.replace(/[^0-9+]/g, '')}`} className="btn-ghost">
                    <Phone size={17} />
                    <span>{personalInfo.phone}</span>
                  </a>
                </div>
              </div>
            </div>
          </Card3DTilt>
        </div>
      </section>

      {/* Project Modal Dialog */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}