"use client";

import { useState, FormEvent } from 'react';
import confetti from 'canvas-confetti';
import { personalInfo } from '@/lib/portfolioData';
import { GithubIcon, LinkedinIcon } from '@/components/Common/Icons';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import styles from './Contact.module.css';

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const copyToClipboard = (text: string, type: 'email' | 'phone') => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (type === 'email') {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      } else {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
      }
    }
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    const form = event.currentTarget;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: json,
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setFeedbackMessage("Thank you! Your message has been sent directly to Samartha S. I will respond promptly.");
        form.reset();
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } else {
        setStatus('error');
        setFeedbackMessage(result.message || 'An error occurred while transmitting your message.');
      }
    } catch {
      setStatus('error');
      setFeedbackMessage('An unexpected network error occurred. Please contact via direct email.');
    }
  }

  return (
    <div className={`container ${styles.contactPage}`}>
      {/* Header */}
      <div className={styles.headerBlock}>
        <span className={styles.eyebrow}>GET IN TOUCH</span>
        <h1 className={styles.title}>
          Let&apos;s Build Something <span className="gradient-text">Exceptional</span>
        </h1>
        <p className={styles.subtitle}>
          Have an autonomous robotics project, technical training requirement, or research inquiry? Reach out directly using the form below or contact channels.
        </p>
      </div>

      <div className={styles.layout}>
        {/* Left Information Panel */}
        <div className={`glass-panel ${styles.infoPanel}`}>
          <div className="status-pill">
            <span className="pulse-dot" />
            <span>Open for Opportunities &amp; Training</span>
          </div>

          <h2 className={styles.infoHeading}>Contact Information</h2>
          <p className={styles.infoDesc}>
            Based in Bengaluru &amp; Vijayapura, India. Available for technical consultation, full-time robotics engineering roles, and custom hands-on workshops.
          </p>

          <div className={styles.contactList}>
            {/* Email Card */}
            <div className={styles.contactItemCard}>
              <div className={styles.itemIconBox}>
                <Mail size={18} />
              </div>
              <div className={styles.itemContent}>
                <span className={styles.itemLabel}>Primary Email</span>
                <a href={`mailto:${personalInfo.email}`} className={styles.itemValue}>
                  {personalInfo.email}
                </a>
              </div>
              <button
                onClick={() => copyToClipboard(personalInfo.email, 'email')}
                className={styles.copyBtn}
                title="Copy email"
                aria-label="Copy email"
              >
                {copiedEmail ? <Check size={14} className={styles.copySuccess} /> : <Copy size={14} />}
              </button>
            </div>

            {/* Phone Card */}
            <div className={styles.contactItemCard}>
              <div className={styles.itemIconBox}>
                <Phone size={18} />
              </div>
              <div className={styles.itemContent}>
                <span className={styles.itemLabel}>Phone &amp; WhatsApp</span>
                <a href={`tel:${personalInfo.phone.replace(/[^0-9+]/g, '')}`} className={styles.itemValue}>
                  {personalInfo.phone}
                </a>
              </div>
              <button
                onClick={() => copyToClipboard(personalInfo.phone, 'phone')}
                className={styles.copyBtn}
                title="Copy phone"
                aria-label="Copy phone"
              >
                {copiedPhone ? <Check size={14} className={styles.copySuccess} /> : <Copy size={14} />}
              </button>
            </div>

            {/* Location Card */}
            <div className={styles.contactItemCard}>
              <div className={styles.itemIconBox}>
                <MapPin size={18} />
              </div>
              <div className={styles.itemContent}>
                <span className={styles.itemLabel}>Location</span>
                <span className={styles.itemValue}>{personalInfo.location}</span>
              </div>
            </div>
          </div>

          {/* Social Profiles */}
          <div className={styles.socialBlock}>
            <span className={styles.socialHeading}>Connect on Platforms</span>
            <div className={styles.socialButtons}>
              <a
                href={personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialPill}
              >
                <GithubIcon size={16} />
                <span>GitHub (@samptec)</span>
              </a>
              <a
                href={personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialPill}
              >
                <LinkedinIcon size={16} />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Contact Form */}
        <div className={`glass-panel ${styles.formPanel}`}>
          <h2 className={styles.formHeading}>Send a Direct Message</h2>
          <p className={styles.formSubtitle}>
            Fill out the details below and your inquiry will be dispatched straight to my primary inbox.
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="hidden"
              name="access_key"
              value={process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || "e472251a-7b3b-482a-a924-f7b6b85d95e0"}
            />
            <input
              type="hidden"
              name="subject"
              value="New Message from Samartha S Portfolio"
            />
            <input
              type="checkbox"
              name="botcheck"
              style={{ display: 'none' }}
            />

            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                Full Name <span className={styles.req}>*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="e.g. Dr. Alex Morgan"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email Address <span className={styles.req}>*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="alex@company.com"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="topic" className={styles.label}>
                Subject / Inquiry Domain
              </label>
              <input
                type="text"
                id="topic"
                name="topic"
                placeholder="Autonomous Navigation / Drone Project / Training Workshop"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="message" className={styles.label}>
                Message <span className={styles.req}>*</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                placeholder="Describe your vision, technical requirements, or schedule..."
                className={styles.textarea}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className={`btn-primary ${styles.submitBtn}`}
            >
              {status === 'submitting' ? (
                <>
                  <span className="pulse-dot" />
                  <span>Transmitting...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Send Message</span>
                </>
              )}
            </button>

            {status === 'success' && (
              <div className={styles.successAlert}>
                <CheckCircle2 size={18} />
                <span>{feedbackMessage}</span>
              </div>
            )}

            {status === 'error' && (
              <div className={styles.errorAlert}>
                <AlertCircle size={18} />
                <span>{feedbackMessage}</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}