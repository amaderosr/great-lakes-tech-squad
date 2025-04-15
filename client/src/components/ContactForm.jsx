import React, { useState } from 'react';
import axios from 'axios';

const ContactForm = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[ContactForm] Sending form:', form); // 💬 logs name, email, message
  
    try {
      const res = await axios.post('http://localhost:5001/api/contact', form);
      console.log('[ContactForm] Server response:', res.data); // ✅ log backend reply
      alert('Message sent successfully!');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('[ContactForm] Error:', err.response?.data || err.message); // 🛑 log error clearly
      alert('Something went wrong.');
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
          className="w-full border px-4 py-2 rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border px-4 py-2 rounded"
        />
        <textarea
          name="message"
          placeholder="Your Message"
          value={form.message}
          onChange={handleChange}
          required
          className="w-full border px-4 py-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Send Message
        </button>
      </form>
    </section>
  );
};

export default ContactForm;