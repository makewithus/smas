"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Send,
  Loader2,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Globe,
  Share2,
} from "lucide-react";
import { INSTITUTION } from "@/src/lib/constants";
import { toast } from "sonner";

// Page Hero Component
function PageHero({ title, breadcrumbs }) {
  return (
    <section className="h-70 bg-brand flex flex-col items-center justify-center text-center px-6">
      <h1 className="font-serif text-4xl text-white mb-4">{title}</h1>
      <nav className="flex items-center gap-1 text-sm text-white/60">
        {breadcrumbs.map((crumb, idx) => (
          <span key={idx} className="flex items-center gap-1">
            {idx > 0 && <ChevronRight size={14} />}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="hover:text-white transition-colors"
              >
                {crumb.label}
              </Link>
            ) : (
              <span>{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
    </section>
  );
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmitted(true);
      toast.success("Message sent successfully!");
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <>
      <PageHero
        title="Contact Us"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <section className="py-16 bg-background">
        <div className="max-w-300 mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Contact Form */}
            <div className="bg-white border border-[#E8DFD4] rounded-md p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <h3 className="font-serif text-2xl text-brand mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-neutral-600 mb-6">
                    Thank you for contacting us. We will get back to you soon.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        subject: "",
                        message: "",
                      });
                    }}
                    className="btn-outline"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-serif text-2xl text-brand mb-6">
                    Send a Message
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="label label-required">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`input ${errors.name ? "input-error" : ""}`}
                        placeholder="Your name"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="label label-required">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`input ${errors.email ? "input-error" : ""}`}
                        placeholder="your.email@example.com"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="label">Phone (Optional)</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="input"
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    <div>
                      <label className="label label-required">Subject</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`input ${errors.subject ? "input-error" : ""}`}
                        placeholder="What is this regarding?"
                      />
                      {errors.subject && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.subject}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="label label-required">Message</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        className={`input h-auto py-2.5 resize-none ${errors.message ? "input-error" : ""}`}
                        placeholder="Your message..."
                      />
                      {errors.message && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full py-3"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Contact Info */}
            <div className="bg-white border border-[#E8DFD4] rounded-md p-8">
              <h2 className="font-serif text-xl text-brand mb-6">
                {INSTITUTION.name}
              </h2>

              <ul className="space-y-5 mb-8">
                <li className="flex items-start gap-4">
                  <MapPin size={18} className="text-accent mt-0.5 shrink-0" />
                  <span className="text-sm text-neutral-700">
                    {INSTITUTION.address}
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <Phone size={18} className="text-accent mt-0.5 shrink-0" />
                  <a
                    href={`tel:${INSTITUTION.phone.replace(/\s/g, "")}`}
                    className="text-sm text-neutral-700 hover:text-brand transition-colors"
                  >
                    {INSTITUTION.phone}
                  </a>
                </li>
                <li className="flex items-start gap-4">
                  <Mail size={18} className="text-accent mt-0.5 shrink-0" />
                  <a
                    href={`mailto:${INSTITUTION.email}`}
                    className="text-sm text-neutral-700 hover:text-brand transition-colors"
                  >
                    {INSTITUTION.email}
                  </a>
                </li>
                <li className="flex items-start gap-4">
                  <Clock size={18} className="text-accent mt-0.5 shrink-0" />
                  <div className="text-sm text-neutral-700">
                    <p>Monday - Friday: 8:00 AM - 4:00 PM</p>
                    <p>Saturday: 9:00 AM - 1:00 PM</p>
                  </div>
                </li>
              </ul>

              {/* Social Links */}
              <div className="flex items-center gap-3 mb-8">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-neutral-600 hover:bg-brand hover:text-white transition-colors"
                  aria-label="Website"
                >
                  <Globe size={18} />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-neutral-600 hover:bg-brand hover:text-white transition-colors"
                  aria-label="Share"
                >
                  <Share2 size={18} />
                </a>
              </div>

              {/* Map Placeholder */}
              <div className="bg-surface border border-[#E8DFD4] rounded-md p-10 flex flex-col items-center justify-center">
                <MapPin size={48} className="text-neutral-400 mb-3" />
                <p className="text-sm text-neutral-600">Location Map</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
