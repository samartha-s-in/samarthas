export interface Project {
  slug: string;
  title: string;
  category: 'Robotics & ROS' | 'AI & CV' | 'Drones & UAVs' | 'Embedded & IoT' | 'CAD & 3D' | 'Web Dev';
  tagline: string;
  description: string;
  longDescription?: string;
  techStack: string[];
  featured?: boolean;
  githubUrl?: string;
  liveUrl?: string;
  date?: string;
  highlights?: string[];
}

export interface Experience {
  role: string;
  company: string;
  department?: string;
  location: string;
  period: string;
  type: 'Full-time' | 'Research' | 'Internship' | 'Freelance';
  description: string;
  highlights: string[];
  link?: string;
  email?: string;
  website?: string;
}

export interface Education {
  degree: string;
  institution: string;
  location: string;
  period: string;
  grade: string;
  details: string;
  highlights: string[];
  website?: string;
}

export interface Publication {
  title: string;
  journal: string;
  publisher: string;
  year: string;
  pages: string;
  authors: string[];
  citation: string;
  bibtex: string;
  abstract: string;
  link: string;
}

export interface SkillCategory {
  name: string;
  icon: string;
  skills: { name: string; level: number; tags?: string[] }[];
}

export const personalInfo = {
  name: "Samartha S",
  title: "Robotics & AI Engineer | Autonomous Systems Specialist",
  tagline: "Pioneering the intersection of Autonomous Robotics, Computer Vision, and Embedded Intelligence.",
  bio: "Highly motivated and analytical Robotics Engineer with a strong academic foundation and hands-on experience in designing, developing, and deploying innovative robotic systems and IoT solutions. Proven expertise in ROS/ROS2, autonomous navigation algorithms, SLAM, drone dynamics (MAVROS/PX4), PCB design, computer vision (TensorFlow/OpenCV), and CAD tools (CATIA, Fusion 360). Passionate about empowering the next generation of engineers, having trained 5,000+ students and professionals across India.",
  location: "Bengaluru, Karnataka, India",
  email: "samarthas312@gmail.com",
  nmitEmail: "samartha.s@nmit.ac.in",
  phone: "(+91) 8861486949",
  github: "https://github.com/samptec",
  githubOrg: "https://github.com/samartha-s-in",
  linkedin: "https://www.linkedin.com/in/samartha-s",
  resumePdf: "/SamarthaS_CV.pdf",
  avatarUrl: "/samartha.png",
  stats: [
    { label: "Students Trained", value: "5,000+", detail: "Across top engineering institutes" },
    { label: "IEEE Publication", value: "1 (ICCCNT)", detail: "Floor Maintenance Autonomous Robot" },
    { label: "Robotics & R&D", value: "4+ Years", detail: "ROS, ROS2, SLAM, MAVROS" },
    { label: "Engineered Prototypes", value: "10+", detail: "Hardware, Drones & AI systems" },
  ],
  languages: [
    { language: "English", proficiency: "Fluent (C2)" },
    { language: "Kannada", proficiency: "Native / Mother Tongue" },
    { language: "Hindi", proficiency: "Professional (B2)" },
    { language: "Telugu", proficiency: "Conversational (B1)" },
    { language: "German", proficiency: "Elementary (A1)" }
  ],
  interests: [
    "Autonomous Robotics & Swarm Intelligence",
    "Technical Mentorship & Hands-on Training",
    "Unmanned Aerial Vehicles & Drone Dynamics",
    "Aerospace Modeling & 3D Fabrication",
    "Travel & Sports"
  ]
};

export const publications: Publication[] = [
  {
    title: "A Comprehensive Solution for Indoor and Outdoor Floor Maintenance",
    journal: "15th International Conference on Computing Communication and Networking Technologies (ICCCNT)",
    publisher: "IEEE",
    year: "2024",
    pages: "pp. 1-6",
    authors: ["M. R. Bharamagoudra", "S. Samartha", "S. G. Dharwad", "B. Suriyha"],
    abstract: "This research presents a Bluetooth-controlled floor cleaning robot designed for efficient and automated sanitation across diverse surfaces. Controlled via a custom smartphone interface, the robot features a sweeping brush, mop arm with integrated water tank, and a duster arm, enabling thorough multi-surface cleaning. Powered by high-efficiency BLDC motors and an Arduino Mega microcontroller, it offers millimeter-precise movement and smooth operational autonomy. Combining robust mechanical design and electronic control, this robot delivers a smart, cost-effective solution to modern industrial and domestic floor cleaning challenges.",
    citation: 'M. R. Bharamagoudra, S. Samartha, S. G. Dharwad and B. Suriyha, "A Comprehensive Solution for Indoor and Outdoor Floor Maintenance," 2024 15th ICCCNT, Kamand, India, 2024, pp. 1-6.',
    bibtex: `@INPROCEEDINGS{10593452,
  author={Bharamagoudra, M. R. and Samartha, S. and Dharwad, S. G. and Suriyha, B.},
  booktitle={2024 15th International Conference on Computing Communication and Networking Technologies (ICCCNT)}, 
  title={A Comprehensive Solution for Indoor and Outdoor Floor Maintenance}, 
  year={2024},
  pages={1-6},
  publisher={IEEE}
}`,
    link: "https://drive.google.com/drive/folders/1gie7IK7xu_AYtSEYKqAQ2KWBXo1l0Jvo"
  }
];

export const workExperience: Experience[] = [
  {
    role: "Robotics and AI Developer | Trainer | Freelancer",
    company: "Independent Freelance & Technical Training",
    department: "Research and Development",
    location: "Bengaluru, India",
    period: "May 2026 - Present",
    type: "Freelance",
    email: "samarthas312@gmail.com",
    description: "Building intelligent robotic solutions, autonomous navigation frameworks, and empowering learners through intensive hands-on technical training.",
    highlights: [
      "Mentored and trained ~5,000 students and engineering professionals in robotics, AI development, and project-based engineering.",
      "Delivered customized industry-oriented workshops on ROS 1, ROS 2, autonomous navigation, and IoT embedded design.",
      "Helped businesses, startups, and university teams translate conceptual robotics ideas into functional production-grade prototypes."
    ]
  },
  {
    role: "Research Associate",
    company: "Center of Robotic Research, Nitte Meenakshi Institute of Technology (NMIT)",
    department: "Robotics and AI",
    location: "Bengaluru, India",
    period: "June 2025 - March 2026",
    type: "Research",
    email: "samartha.s@nmit.ac.in",
    website: "https://nmit.ac.in",
    link: "https://drive.google.com/file/d/1gfIpDZmyhQCCLkDDYFoTXKp-rR_1fDc9/view?usp=drivesdk",
    description: "Spearheaded research and experimental prototyping in advanced robotic systems, autonomous ground navigation, and embedded edge computing.",
    highlights: [
      "Assisted in the design and deployment of autonomous navigation algorithms leveraging ROS and ROS 2 frameworks with SLAM.",
      "Integrated multi-sensor arrays (LiDAR, ultrasonic, IMUs) with embedded Linux platforms for real-time robotic perception.",
      "Conducted advanced Robotics and AI laboratory training sessions for M.Tech post-graduate engineering scholars.",
      "Collaborated with faculty on experimental validation, prototype fabrication, and academic publication deliverables."
    ]
  },
  {
    role: "Robotics Software Engineer",
    company: "Newrro Tech LLP",
    department: "Robotics",
    location: "Bengaluru, India",
    period: "June 2025 - April 2026",
    type: "Full-time",
    email: "samartha.s@newrro.in",
    website: "https://newrro.in",
    description: "Designed, programmed, and validated autonomous mobile robot (AMR) architectures using ROS 1 and ROS 2 for industrial automation.",
    highlights: [
      "Architected autonomous navigation pipelines, mechanical load stress simulations, and path planning nodes.",
      "Conducted extensive hands-on training sessions on proprietary AMR products across premier institutes (BMSCE, REVA University, MSRUAS, SVIT, VidyaShilp University).",
      "Trained over 3,000 engineering students through corporate-academic collaboration programs."
    ]
  },
  {
    role: "Intern - Robotics Developer",
    company: "Newrro Tech LLP",
    department: "Robotics",
    location: "Bengaluru, India",
    period: "January 2025 - April 2025",
    type: "Internship",
    description: "Developed core navigation and sensor integration modules for industrial AMR platforms.",
    highlights: [
      "Implemented ROS/ROS2 communication nodes for motor drivers, encoders, and laser rangefinders.",
      "Created 3D CAD models and simulated chassis kinematics under dynamic payloads."
    ]
  },
  {
    role: "Intern - Mechanical & IoT Electronics Design Engineer",
    company: "Drona Automations Pvt Ltd",
    department: "Robotics & Cleantech",
    location: "Bengaluru, India",
    period: "October 2022 - April 2023",
    type: "Internship",
    website: "http://dronaautomations.com",
    description: "Engineered specialized sewage-cleaning robotic solutions combining CATIA mechanical drafting and custom IoT controller boards.",
    highlights: [
      "Drafted production-grade mechanical enclosures and linkage assemblies in CATIA.",
      "Designed and flashed firmware onto custom IoT microcontrollers with sensor telemetry for harsh aquatic environments."
    ]
  }
];

export const educationList: Education[] = [
  {
    degree: "Bachelor of Technology in Robotics and Automation",
    institution: "REVA University",
    location: "Bengaluru, India",
    period: "Dec 2022 - June 2025",
    grade: "CGPA: 8.21 / 10",
    website: "https://reva.edu.in",
    details: "Multidisciplinary engineering program encompassing kinematics, dynamics, control systems, computer vision, machine learning, embedded systems, and industrial robotics.",
    highlights: [
      "Graduated with distinction (8.21 CGPA).",
      "Core coursework: SLAM, Control Systems, Autonomous Navigation, Microprocessors, Kinematics, Cyber-Physical Systems.",
      "Active participant at REVA NEST startup innovation ecosystem solving real-world robotics and automation challenges.",
      "Completed hands-on capstone projects bridging hardware microcontrollers (Raspberry Pi, Arduino, Jetson) with software algorithms (ROS, Python, C++)."
    ]
  },
  {
    degree: "Pre-University Education (PCMB - Physics, Chemistry, Math, Biology)",
    institution: "Mahaveer Jain PU College, Jayanagar",
    location: "Bengaluru, India",
    period: "2018 - 2020",
    grade: "77.6%",
    website: "https://www.jaincollege.ac.in",
    details: "Strong scientific and mathematical foundation preceding undergraduate engineering studies.",
    highlights: [
      "Rigorous pre-engineering foundation in advanced calculus, mechanics, electromagnetic physics, and chemistry."
    ]
  }
];

export const skillCategories: SkillCategory[] = [
  {
    name: "Robotics & Autonomy",
    icon: "Bot",
    skills: [
      { name: "ROS & ROS 2", level: 95, tags: ["Humble", "Jazzy", "Noetic", "Nodes", "Pub/Sub"] },
      { name: "ROS Navigation (Nav2)", level: 90, tags: ["Costmaps", "Path Planning", "AMCL"] },
      { name: "SLAM (Simultaneous Localization & Mapping)", level: 88, tags: ["Cartographer", "Gmapping"] },
      { name: "MAVROS & PX4 Flight Control", level: 92, tags: ["Pixhawk", "Autonomous Waypoints"] },
      { name: "Autonomous Mobile Robots (AMR)", level: 90, tags: ["Chassis Kinematics", "Sensors"] },
      { name: "Sensor Integration & LiDAR", level: 92, tags: ["LiDAR", "Ultrasonic", "IMU", "Encoders"] },
      { name: "Human-Robot Collaboration", level: 85, tags: ["Safety", "Mechatronics"] }
    ]
  },
  {
    name: "AI & Computer Vision",
    icon: "Cpu",
    skills: [
      { name: "OpenCV & Computer Vision", level: 90, tags: ["Object Tracking", "Contours", "Color Space"] },
      { name: "TensorFlow & Keras", level: 85, tags: ["CNNs", "Transfer Learning", "Classification"] },
      { name: "Optical Character Recognition (OCR)", level: 88, tags: ["Tesseract", "Date/MRP Extraction"] },
      { name: "Deep Learning & Machine Learning", level: 86, tags: ["Scikit-Learn", "Model Training"] },
      { name: "Speech Recognition & NLP", level: 84, tags: ["Pyttsx3", "Voice Commands", "NLP"] },
      { name: "Biometric Face Recognition", level: 85, tags: ["Facial Embeddings", "Security"] }
    ]
  },
  {
    name: "Embedded & IoT",
    icon: "Radio",
    skills: [
      { name: "Raspberry Pi & Embedded Linux", level: 92, tags: ["GPIO", "Real-Time Telemetry"] },
      { name: "ESP32 & Arduino (Mega/Uno)", level: 94, tags: ["C++ Firmware", "BLE", "WiFi"] },
      { name: "NVIDIA Jetson (TX2 / Nano)", level: 86, tags: ["CUDA", "Edge AI Inference"] },
      { name: "LoRa & LoRaWAN", level: 82, tags: ["Long Range Telemetry", "IoT Gateways"] },
      { name: "Actuators & Motor Drivers", level: 92, tags: ["BLDC", "Stepper", "Servo", "ESC Tuning"] },
      { name: "Medical Telemetry & Biosensors", level: 85, tags: ["ECG", "Pulse Oximeter", "Temp"] }
    ]
  },
  {
    name: "CAD & Hardware Design",
    icon: "Layers",
    skills: [
      { name: "CATIA V5", level: 88, tags: ["Part Design", "Assembly", "Drafting"] },
      { name: "Autodesk Fusion 360", level: 88, tags: ["Parametric CAD", "Stress Simulation"] },
      { name: "PCB Design (KiCad & EasyEDA)", level: 86, tags: ["Schematic", "Gerber", "Routing"] },
      { name: "Altium Designer (Fundamentals)", level: 75, tags: ["Multi-layer routing"] },
      { name: "3D Fabrication & Rapid Prototyping", level: 90, tags: ["FDM Printing", "Assembly"] }
    ]
  },
  {
    name: "Languages & Software",
    icon: "Code2",
    skills: [
      { name: "Python", level: 94, tags: ["NumPy", "Pandas", "Matplotlib", "FastAPI"] },
      { name: "C / C++", level: 88, tags: ["Robotics Systems", "Firmware", "OOP"] },
      { name: "Linux & Bash", level: 92, tags: ["Ubuntu", "Shell Scripting", "SSH", "Systemd"] },
      { name: "Git & Version Control", level: 90, tags: ["GitHub", "Workflows"] },
      { name: "MATLAB & Simulink", level: 82, tags: ["Kinematics Modeling", "Simulation"] },
      { name: "Web Technologies (Next.js/React)", level: 80, tags: ["Fullstack", "Modern UI"] }
    ]
  }
];

export const projects: Project[] = [
  {
    slug: 'autonomous-drone-navigation',
    title: 'Autonomous Drone Navigation with MAVROS & LiDAR',
    category: 'Drones & UAVs',
    tagline: 'Pixhawk-powered quadcopter with full indoor and outdoor autonomous navigation & real-time telemetry.',
    description: 'Engineered an advanced autonomous drone platform by interfacing a Pixhawk flight controller with onboard Companion Computer via MAVROS and ROS. Integrated GPS, 2D LiDAR, and ultrasonic altitude sensors for accurate positioning, dynamic obstacle avoidance, and mission waypoint tracking in GPS-denied environments.',
    longDescription: 'This autonomous aerial platform resolves key challenges in autonomous indoor drone navigation where GPS satellite signals are unavailable. By integrating planar LiDAR scanning with ultrasonic proximity telemetry and fusing IMU state estimations through MAVROS, the quadcopter achieves rock-solid station keeping and collision-free waypoint trajectory traversal. Built from ground-up hardware components with custom-soldered ESC distribution and real-time FPV video transmission.',
    techStack: ['ROS 2', 'MAVROS', 'PX4 Flight Stack', 'LiDAR', 'Pixhawk', 'GPS', 'Sensor Fusion', 'Python', 'C++'],
    featured: true,
    date: 'Nov 2024 - June 2025',
    highlights: [
      'Indoor & outdoor waypoint navigation without human intervention',
      'Millisecond-level telemetry transmission to ground station',
      'Integrated real-time obstacle avoidance with LiDAR range streams',
      'Custom tuned PID coefficients for aerodynamic stability'
    ],
    liveUrl: 'https://drive.google.com/file/d/1hdSHrm5YOn8qc0QlHbDnkMLecqObfcoq/view?usp=drivesdk'
  },
  {
    slug: 'automated-product-recognition',
    title: 'Automated Product Recognition & QC (Flipkart GRID 6.0)',
    category: 'AI & CV',
    tagline: 'Deep learning & OCR automated freshness assessment and warehouse inventory defect inspection.',
    description: 'Developed an automated computer vision quality check system for Flipkart GRID 2024. Uses deep learning (TensorFlow/Keras) for instant product SKU classification and freshness verification alongside OCR algorithms to automatically extract manufacturing dates, expiry dates, and MRP directly from packaging.',
    longDescription: 'In high-throughput fulfillment centers, manual QC of packaged goods creates bottlenecks. This Python-based industrial vision pipeline reads package surfaces, performs optical character recognition (OCR) on non-uniform text fonts, validates shelf-life against system databases, and triggers automated bin diversion if defects or expired goods are recognized.',
    techStack: ['Python', 'TensorFlow', 'Deep Learning', 'Tesseract OCR', 'OpenCV', 'Computer Vision', 'Pandas'],
    featured: true,
    date: 'Sept 2024 - Oct 2024',
    highlights: [
      'Engineered for Flipkart GRID 2024 industrial logistics hackathon',
      'High-precision date and MRP text extraction across varied packaging materials',
      'Automated defect flagging reducing human inspection overhead',
      'Deep learning classifier trained on custom product dataset'
    ],
    liveUrl: 'https://drive.google.com/file/d/1h1LJ8odXdNmp-7ayJmHLyn2qgsWrTsom/view?usp=drivesdk'
  },
  {
    slug: 'robogleam-floor-cleaner',
    title: 'RoboGleam - Intelligent Dual-Arm Floor Cleaning Robot',
    category: 'Robotics & ROS',
    tagline: 'Bluetooth-controlled dual-arm sanitation robot equipped with dusting, water spray, and active mop mechanism.',
    description: 'Designed and built a dual-arm floor sanitation mobile robot suited for both indoor and outdoor commercial floors. Features high-torque BLDC drive motors, an Arduino Mega controller, Bluetooth wireless smartphone control, and custom motorized arms for table dusting and wet moping with an integrated water pump reservoir.',
    longDescription: 'Published in IEEE ICCCNT 2024, RoboGleam combines mechanical design and embedded automation to deliver a smart, cost-effective sanitizing system. Equipped with dual specialized robotic arms: an articulated top duster for clearing table tops and elevated debris, and a rear mopping arm fed by a pressurized pump and water tank reservoir.',
    techStack: ['Arduino Mega', 'BLDC Motors', 'Motor Drivers', 'Bluetooth BLE', 'Mechanical CAD', 'Mechatronics', 'Embedded C++'],
    featured: true,
    date: 'July 2023 - Nov 2023',
    highlights: [
      'Published in IEEE 15th ICCCNT (2024) conference proceedings',
      'Dual active robotic arms for simultaneous dusting and liquid sanitizing',
      'Smartphone app interface with real-time speed and pump actuation',
      'High-torque motor layout handling rough outdoor pavements and slick indoor tile'
    ],
    liveUrl: 'https://drive.google.com/drive/folders/1-EOYLkUtBmahFiSPzkfEI0wTFZ3aHfzJ?usp=drive_link'
  },
  {
    slug: 'pixhawk-drone-development',
    title: 'Autonomous Pixhawk Quadcopter Drone Platform',
    category: 'Drones & UAVs',
    tagline: 'Self-initiated high-payload quadcopter engineered with Pixhawk, GPS telemetry, and custom power distribution.',
    description: 'Built a fully operational quadcopter drone utilizing a Pixhawk flight controller. Engineered all aspects from physical airframe assembly, motor/ESC wiring, and power distribution board soldering, to configuring ArduPilot/PX4 flight firmware and GPS failsafes.',
    longDescription: 'This comprehensive aerospace engineering initiative served as the foundational hardware bed for testing flight dynamics, PID tuning, vibration isolation, telemetry radio links, and fail-safe return-to-launch (RTL) capabilities.',
    techStack: ['Pixhawk', 'PX4', 'QGroundControl', 'Soldering', 'ESC Tuning', 'LiPo Battery Safety', 'Avionics'],
    featured: false,
    date: 'Feb 2024 - May 2024',
    highlights: [
      'Full physical assembly, harness soldering, and ESC calibration',
      'Tuned flight PID parameters for high wind resilience',
      'Integrated GPS telemetry module with real-time Ground Control Station syncing',
      'Tested failsafe protocols including auto-RTL on low battery and signal loss'
    ],
    liveUrl: 'https://drive.google.com/drive/folders/1lAY88G-94y7JmFeyVIHnqkRH-_oXV4VT'
  },
  {
    slug: 'voice-controlled-smart-home',
    title: 'Voice Controlled Smart Home Automation with AI',
    category: 'Embedded & IoT',
    tagline: 'Speech-driven IoT ecosystem with natural language processing and live AI informational assistants.',
    description: 'Developed an intelligent home automation ecosystem driven by speech recognition and natural language processing. Enables remote switching of lighting, fans, and home appliances alongside an integrated AI assistant that provides news summaries, weather, and real-time question answering.',
    longDescription: 'Bridges physical electrical relays with edge computing. Voice commands captured through microphone arrays are parsed by local Python NLP models, activating relay switches with zero latency while conversational queries query cloud knowledge models.',
    techStack: ['Python', 'Raspberry Pi', 'NLP', 'Speech Recognition', 'Relay Circuits', 'IoT', 'Pyttsx3'],
    featured: true,
    date: 'June 2025 - Present',
    highlights: [
      'Voice-activated remote device actuation with sub-second response',
      'AI-backed voice assistant delivering news, jokes, and telemetry updates',
      'Modular relay board architecture compatible with high voltage appliances',
      'Energy consumption monitoring and scheduling capabilities'
    ]
  },
  {
    slug: 'health-monitoring-system',
    title: 'Raspberry Pi Critical Health Monitoring System',
    category: 'Embedded & IoT',
    tagline: 'Real-time telemetry of vital signs including ECG, heart rate, blood pressure, and emergency cloud alerts.',
    description: 'Constructed an embedded vital signs monitoring device using Raspberry Pi. Provides simultaneous real-time graphical display of ECG waveforms, heart rate, blood pressure, and core temperature on a local LCD with synchronized cloud telemetry and instant SMS/email emergency alerts.',
    longDescription: 'Designed to deliver ICU-grade remote patient telemetry for rural clinics and home-care settings. Analog biosensors interface with an ADC to stream vital cardiac and pulmonary metrics to a Raspberry Pi, which executes threshold anomaly detection to alert physicians in real-time.',
    techStack: ['Raspberry Pi', 'Python', 'Biomedical Sensors', 'ECG Sensor', 'ADC', 'LCD Display', 'Cloud Telemetry'],
    featured: false,
    date: 'Sept 2023 - Nov 2023',
    highlights: [
      'Live dynamic ECG waveform visualization on high-contrast LCD screen',
      'Cloud database synchronization for remote clinician monitoring',
      'Automated emergency push notifications triggered by cardiac anomalies',
      'Low-power portable design for bedside and ambulatory care'
    ],
    liveUrl: 'https://drive.google.com/file/d/1hdSHrm5YOn8qc0QlHbDnkMLecqObfcoq/view?usp=drivesdk'
  },
  {
    slug: 'frank-ai-assistant',
    title: 'Frank AI - Voice Assistant with Biometric Face Recognition',
    category: 'AI & CV',
    tagline: 'Personal voice AI assistant with real-time OpenCV facial identification and personalized greeting privileges.',
    description: 'Engineered an AI personal assistant with two functional iterations. Features continuous speech recognition and a secondary computer vision module that recognizes authorized human faces in real time, greeting them by name and tailoring active permission levels.',
    longDescription: 'Frank AI integrates speech synthesis, speech recognition, and facial recognition embeddings. The assistant operates continuously in the background, identifying who approaches the workstation and adjusting available automation routines based on user identity.',
    techStack: ['Python', 'OpenCV', 'Face Recognition', 'SpeechRecognition', 'Pyttsx3', 'AI'],
    featured: false,
    date: 'March 2021 - Aug 2021',
    highlights: [
      'Real-time biometric facial recognition and identity greeting',
      'Two progressive versions from voice control to multi-modal perception',
      'Permission isolation based on identified user profile',
      'Offline-capable voice recognition for rapid response execution'
    ],
    githubUrl: 'https://github.com/samptec/Mr.Frank.git'
  },
  {
    slug: 'gslv-mk-ii-design',
    title: 'GSLV Mk II Rocket 3D Fabrication & Outer Skeleton CAD',
    category: 'CAD & 3D',
    tagline: 'High-fidelity CAD modeling and assembly of ISRO’s GSLV Mk II launch vehicle part-by-part.',
    description: 'Created highly detailed 3D models and mechanical assemblies using CATIA and Fusion 360. Highlighted by the precision recreation of the Indian Space Research Organisation (ISRO) GSLV Mk II satellite launching vehicle, drafting every stage, strap-on booster, and payload fairing part-by-part.',
    longDescription: 'Parametrically modeled the outer aerodynamic skeleton, cryogenic stage shroud, propellant tanks, and payload fairings. Ensured proper tolerance mating between modular stages for subsequent 3D printing and physical display assembly.',
    techStack: ['CATIA V5', 'Autodesk Fusion 360', '3D Modeling', 'CAED', 'Drafting', 'Aerospace CAD'],
    featured: false,
    date: 'Oct 2022 - Dec 2022',
    highlights: [
      'Complete modular CAD assembly of multi-stage launch vehicle',
      'Detailed drafting of booster fairings, interstage adapters, and nozzles',
      'Prepared slice-ready STL files for additive manufacturing',
      'Created custom mechanical designs: elbow pipes, keychains, and mechanisms'
    ],
    githubUrl: 'https://github.com/samptec/GSLV_II.git'
  },
  {
    slug: 'smart-agriculture-system',
    title: 'Smart Agriculture Monitoring & Irrigation System',
    category: 'Embedded & IoT',
    tagline: 'IoT environmental monitoring station with soil moisture analysis and smart solenoid irrigation automation.',
    description: 'Collaborated in a team of 3 to design and deploy an IoT smart farming station. Spearheaded the circuit architecture and microcontroller firmware to monitor microclimate, ambient humidity, and soil moisture levels, automating irrigation pumps to optimize water conservation.',
    longDescription: 'Helps agriculturalists eliminate manual irrigation guesswork. Multiple soil moisture sensors feed moisture readings into an embedded controller which modulates high-power solenoid water valves based on ambient humidity and crop thresholds.',
    techStack: ['Arduino', 'Soil Moisture Sensors', 'Relays & Solenoids', 'IoT Sensors', 'C++', 'Circuit Design'],
    featured: false,
    date: 'Sept 2022 - Nov 2022',
    highlights: [
      'Automated water conservation through threshold-triggered irrigation',
      'Continuous microclimate and soil moisture tracking',
      'Custom circuit schematics and power regulation for outdoor deployment'
    ],
    liveUrl: 'https://drive.google.com/drive/folders/1lUvSy_hwFVAFZuj6Wl6ril8QQhAG5ooF'
  },
  {
    slug: 'infinitemart-service-platform',
    title: 'InfiniteMart - Enterprise Service Provider Portal',
    category: 'Web Dev',
    tagline: 'Modern service provider platform offering tech repairs, stationery logistics, and vendor sales.',
    description: 'Designed and deployed a full multi-vendor web portal for service providers offering laptop repair, office stationeries, and corporate sales services.',
    longDescription: 'Built with responsive UI layouts, clean navigation, product catalogs, and contact enquiry funnels to connect local corporate clients with specialized hardware technicians and office supplies.',
    techStack: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design', 'GitHub Pages'],
    featured: false,
    date: 'Aug 2021 - Sept 2021',
    highlights: [
      'Complete end-to-end service catalog and technician booking flow',
      'Fast responsive web architecture deployed to GitHub Pages'
    ],
    liveUrl: 'https://samptec.github.io/InfiniteMart/'
  }
];
