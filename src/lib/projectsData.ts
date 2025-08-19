// This interface defines the structure for each project object
export interface Project {
  slug: string;
  title: string;
  category: 'Robotics & ROS' | 'AI & CV' | 'IoT' | 'Web Dev' | 'CAD';
  tagline: string;
  description: string;
  techStack: string[];
  githubUrl?: string; // Optional property
  liveUrl?: string;   // Optional property
}

// Array of all your projects, extracted from your CV
export const projects: Project[] = [
  {
    slug: 'autonomous-drone-navigation',
    title: 'Integration of MAVROS for Autonomous Drone Navigation',
    category: 'Robotics & ROS',
    tagline: 'Enhancing a Pixhawk-based quadcopter with autonomous navigation for indoor and outdoor use.',
    description: 'This advanced drone project involved integrating GPS, LIDAR, and ultrasonic sensors for precise positioning and obstacle avoidance. By implementing FPV and real-time telemetry, I significantly improved manual and autonomous control, developing deep skills in autonomous systems and UAV dynamics.',
    techStack: ['ROS', 'MAVROS', 'PX4', 'LIDAR', 'GPS', 'UAV Dynamics', 'Sensor Fusion'],
  },
  {
    slug: 'automated-product-recognition',
    title: 'Automated Product Recognition & Quality Check Solution',
    category: 'AI & CV',
    tagline: 'A deep learning system for warehouses to identify products and verify quality.',
    description: 'Developed for the Flipkart Grid 2024 initiative, this project uses TensorFlow for accurate product identification and freshness assessment. It integrates OCR to extract manufacturing dates and MRP from packaging, automatically detecting expired products to enhance inventory management.',
    techStack: ['Python', 'TensorFlow', 'Deep Learning', 'OCR', 'Computer Vision', 'OpenCV'],
    liveUrl: 'https://drive.google.com/file/d/1h1LJ8odXdNmp-7ayJmHLyn2qgsWrTsom/view?usp=drivesdk'
  },
  {
    slug: 'voice-controlled-smart-home',
    title: 'Voice Controlled Smart Home Automation',
    category: 'IoT',
    tagline: 'A speech-controlled system for managing home electronics and appliances.',
    description: 'This system allows users to control devices like lights and fans through voice commands. It is also integrated with AI to provide news updates, jokes, and real-time information, leveraging natural language processing and IoT devices for a seamless user experience.',
    techStack: ['Python', 'IoT', 'Raspberry Pi', 'Natural Language Processing', 'AI'],
  },
  {
    slug: 'health-monitoring-system',
    title: 'Health Monitoring System',
    category: 'IoT',
    tagline: 'A Raspberry Pi-based system for real-time tracking of vital signs.',
    description: 'This project provides real-time tracking of heart rate, blood pressure, ECG, and temperature. It features an instant graphical representation on an LCD display, cloud integration for remote monitoring, and an alert system for emergency notifications to healthcare providers.',
    techStack: ['Raspberry Pi', 'IoT', 'Sensors', 'Cloud Integration', 'Python'],
    liveUrl: 'https://drive.google.com/file/d/1hdSHrm5YOn8qc0QlHbDnkMLecqObfcoq/view?usp=drivesdk'
  },
  {
    slug: 'frank-ai-assistant',
    title: 'Frank AI Personal voice assistant',
    category: 'AI & CV',
    tagline: 'A custom-built, voice-based AI personal assistant with face recognition.',
    description: 'Frank is an AI assistant built for personal use. A second version incorporates face recognition to identify and greet people by name, with future plans to limit system features based on the recognized user.',
    techStack: ['Python', 'AI', 'Face Recognition', 'Speech Recognition', 'OpenCV'],
    githubUrl: 'https://github.com/samptec/Mr.Frank.git'
  },
  {
    slug: 'gslv-mk-ii-design',
    title: '3D Fabrication Designing (GSLV Mk II)',
    category: 'CAD',
    tagline: 'Designing and modeling various parts, including a replica of the GSLV Mk II launch vehicle.',
    description: 'This project involved creating numerous 3D models for college projects. The main highlight was designing the GSLV Mk II launching vehicle part-by-part and assembling its outer skeleton using CAD software.',
    techStack: ['3D Modeling', 'CAD', 'CATIA', 'Fusion 360'],
    githubUrl: 'https://github.com/samptec/GSLV_II.git'
  },
];