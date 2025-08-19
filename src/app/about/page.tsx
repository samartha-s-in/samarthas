"use client";

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './About.module.css';
import Timeline from '@/components/Sections/Timeline';

gsap.registerPlugin(ScrollTrigger);

// Data arrays remain the same
const workExperience = [
  {
    date: 'June 2025 - Current',
    title: 'Research Associate',
    company: 'Center of Robotic Research, Nitte Meenakshi Institute of Technology',
    description: 'Actively involved in developing and testing advanced robotic systems, focusing on autonomous navigation algorithms using ROS/ROS 2, and integrating sensors for real-time applications.'
  },
  {
    date: 'June 2025 - Current',
    title: 'Robotics Software Engineer',
    company: 'Newrro Tech LLP',
    description: 'Designing and programming robotic systems using ROS. Responsibilities include mechanical design, sensor integration, implementing navigation algorithms, and simulation testing.'
  },
  {
    date: 'Jan 2025 - Apr 2025',
    title: 'Intern - Robotics Developer',
    company: 'Newrro Tech LLP',
    description: 'Worked on designing and programming robotic systems using ROS 1 and ROS 2, creating mechanical designs, and implementing navigation algorithms.'
  },
  {
    date: 'Oct 2022 - Apr 2023',
    title: 'Intern - Mechanical and IoT Electronics Design Engineer',
    company: 'Drona Automations Pvt Ltd',
    description: 'Served as a Mechanical Designer and Electronics Engineer, using CATIA for product design and working on IoT boards for sewage cleaning robots.'
  }
];

const education = [
    {
        date: '2022 - 2025',
        title: "Bachelor's in Technology in Robotics and Automation",
        company: 'REVA University, Bengaluru',
        description: 'Gained a multidisciplinary education in mechanical systems, electronics, computer programming, and AI. Acquired practical experience with Arduino, Raspberry Pi, IoT systems, ROS, and more.'
    },
    {
        date: '2018 - 2020',
        title: 'Pre-University Education (Physics, Chemistry, Mathematics and Biology)',
        company: 'Mahaveer Jain PU College, Jayanagar',
        description: 'Completed pre-university studies with a final grade of 77.6%.'
    }
];

const skills = {
    "Robotics & AI": ["ROS/ROS2", "ROS Navigation", "SLAM", "MAVROS", "PX4", "Computer Vision", "OpenCV", "Machine Learning", "Deep Learning", "Control Systems"],
    "Software & Tools": ["Python", "C++", "Linux", "Git", "TensorFlow", "Keras", "Pandas", "Numpy", "MATLAB", "Scikit-Learn"],
    "Hardware & CAD": ["Arduino", "Raspberry Pi", "Jetson TX2", "ESP32", "Pixhawk", "PCB Design (KiCad, EasyEDA)", "CATIA", "Fusion 360", "3D Modeling"]
};


export default function AboutPage() {
    const pageRef = useRef(null);

    useEffect(() => {
        // THE FIX IS HERE: We specify the type <Element> for toArray
        const sections = gsap.utils.toArray<Element>('.animated-section');
        
        sections.forEach((section) => {
            gsap.fromTo(section,
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        });
    }, []);

    return (
        <div ref={pageRef} className="container">
            <section className={`${styles.introSection} animated-section`}>
                <div className={styles.introText}>
                    <h1 className={styles.pageTitle}>About Me</h1>
                    <p>As a highly motivated and analytical Robotics Engineer, I bring a strong academic foundation and hands-on experience in designing, developing, and implementing innovative robotic systems and IoT-based solutions. My expertise spans mechanical design, embedded systems, and software development, with proven proficiency in Python, ROS/ROS2, PCB Design, and CAD tools like CATIA and Fusion360.</p>
                    <p>I am passionate about automation and problem-solving using cutting-edge technologies, eager to contribute to challenging projects in robotics, autonomous systems, and AI to deliver impactful and efficient solutions.</p>
                </div>
                <div className={styles.introImage}>
                    <div className={styles.imagePlaceholder}>
                        Your Professional Photo
                    </div>
                </div>
            </section>
            <section className="animated-section">
                <h2 className={styles.sectionTitle}>Career Journey</h2>
                <Timeline items={workExperience} />
            </section>
            <section className="animated-section">
                <h2 className={styles.sectionTitle}>Education</h2>
                <Timeline items={education} />
            </section>
            <section className={`${styles.skillsSection} animated-section`}>
                <h2 className={styles.sectionTitle}>Technical Skills</h2>
                <div className={styles.skillsGrid}>
                    {Object.entries(skills).map(([category, skillList]) => (
                        <div key={category} className={styles.skillCategory}>
                            <h3>{category}</h3>
                            <ul>
                                {skillList.map(skill => <li key={skill}>{skill}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}