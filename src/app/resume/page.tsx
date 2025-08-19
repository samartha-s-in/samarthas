// Removed unused Link import
import styles from './Resume.module.css';

export default function ResumePage() {
  const resumeUrl = '/SamarthaS_CV.pdf';

  return (
    <div className="container">
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>My Resume</h1>
        <p className={styles.pageSubtitle}>
          Here you can view my resume online or download a copy for your records.
        </p>
        <a 
          href={resumeUrl} 
          download="SamarthaS_CV.pdf" 
          className={styles.downloadButton}
        >
          Download PDF
        </a>
      </div>

      <div className={styles.resumeViewer}>
        <object 
          data={resumeUrl} 
          type="application/pdf" 
          width="100%" 
          height="100%"
          aria-label="PDF resume viewer"
        >
          <p>
            {/* Corrected the apostrophe in "doesn't" to "doesn&apos;t" */}
            It appears your browser doesn&apos;t support embedding PDFs. No problem! You can 
            <a href={resumeUrl} download="SamarthaS_CV.pdf"> download it directly </a> 
            instead.
          </p>
        </object>
      </div>
    </div>
  );
}