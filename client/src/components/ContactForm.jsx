import ReCAPTCHA from 'react-google-recaptcha';
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';


function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [captchaToken, setCaptchaToken] = useState('');
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[ContactForm] Sending form:', form);

    try {
      const res = await axios.post(
        'https://great-lakes-tech-squad.onrender.com/api/contact',
        {
          ...form,
          captchaToken, // ✅ Send token to server
        }
      console.log('[ContactForm] Server response:', res.data);
      setForm({ name: '', email: '', message: '' });
      toast.success('✅ Message sent!');
    } catch (err) {
      console.error('[ContactForm] Error:', err.response?.data || err.message);
      toast.error('❌ Something went wrong. Please try again.');
    }
  };

  return (
    <section id="contact" className="py-16 px-4 bg-white text-center">
      <h2 className="text-3xl font-bold mb-8">Get In Touch</h2>
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border px-4 py-2 rounded" />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border px-4 py-2 rounded" />
        <textarea
          name="message"
          placeholder="Your Message"
          value={form.message}
          onChange={handleChange}
          required
          className="w-full border px-4 py-2 rounded" />

        <ReCAPTCHA
          sitekey="6LdfNhsrAAAAAJUvR5Ig_wTpdWpppvHgpuq7JUHX"  // <-- paste the Site Key from Google
          onChange={(token) => setCaptchaToken(token)}
          className="mx-auto"/>  
          
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Send Message
        </button>
      </form>
    </section>
  );
}

export default ContactForm;