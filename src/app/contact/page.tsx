"use client";

import { useState, FormEvent } from 'react';
import styles from './Contact.module.css';
import Link from 'next/link';

// (SVG Icons remain the same)
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;


export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // (handleSubmit function remains the same)
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    const formData = new FormData(event.currentTarget);
    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: json,
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setFeedbackMessage("Thank you! Your message has been sent successfully.");
        (event.target as HTMLFormElement).reset();
      } else {
        setStatus('error');
        setFeedbackMessage(result.message || 'An error occurred.');
      }
    } catch {
      setStatus('error');
      setFeedbackMessage('An unexpected error occurred.');
    }
  }


  return (
    <div className="container">
      <div className={styles.contactLayout}>
        <div className={styles.infoSide}>
          <h1 className={styles.pageTitle}>Get In Touch</h1>
          <p className={styles.pageSubtitle}>
            {/* Corrected the apostrophe in "I'm" to "I&apos;m" */}
            I&apos;m open to discussing new projects, creative ideas, or opportunities. Feel free to reach out using the form or by using the contact details below.
          </p>
          <div className={styles.contactDetails}>
            <div className={styles.contactItem}>
                <MailIcon />
                <a href="mailto:samarthas312@gmail.com">samarthas312@gmail.com</a>
            </div>
            <div className={styles.contactItem}>
                <PhoneIcon />
                <span>(+91) 8861486949</span>
            </div>
          </div>
          <div className={styles.socialLinks}>
            <Link href="https://www.linkedin.com/" target="_blank">LinkedIn</Link>
            <Link href="https://github.com/samptec" target="_blank">GitHub</Link>
          </div>
        </div>

        <div className={styles.formSide}>
            {/* ... (form JSX remains the same) ... */}
            <form onSubmit={handleSubmit} className={styles.contactForm}>
                <input type="hidden" name="access_key" value={process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY} />
                <input type="hidden" name="subject" value="New Message from Portfolio Contact Form" />
                <input type="checkbox" name="botcheck" className={styles.honeypot} style={{ display: 'none' }} />
                <div className={styles.formGroup}>
                    <label htmlFor="name">Full Name</label>
                    <input type="text" id="name" name="name" required />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="email">Email Address</label>
                    <input type="email" id="email" name="email" required />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="message">Message</label>
                    <textarea id="message" name="message" rows={5} required></textarea>
                </div>
                <button type="submit" className={styles.submitButton} disabled={status === 'submitting'}>
                    {status === 'submitting' ? 'Sending...' : 'Send Message'}
                </button>
                {status === 'success' && <p className={styles.successMessage}>{feedbackMessage}</p>}
                {status === 'error' && <p className={styles.errorMessage}>{feedbackMessage}</p>}
            </form>
        </div>
      </div>
    </div>
  );
}