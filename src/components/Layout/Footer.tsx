// Removed unused Link import
import styles from './Footer.module.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className={styles.footer}>
            <div className={`${styles.footerContent} container`}>
                <div className={styles.socialLinks}>
                    <a href="https://github.com/samptec" target="_blank" rel="noopener noreferrer">GitHub</a>
                    {/* Add your LinkedIn URL here */}
                    <a href="https://www.linkedin.com/in/samartha-s" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                    <a href="mailto:samarthas312@gmail.com">Email</a>
                </div>
                <p>&copy; {currentYear} Samartha S. All Rights Reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;