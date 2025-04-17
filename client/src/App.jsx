import React from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
import ContactForm from './components/ContactForm';
import ChatWidget from './components/ChatWidget'; // ✅ Add this line

function App() {
  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />

      <Navbar />
      <Hero />
      <Services />
      <Testimonials />
      <ContactForm />

      <ChatWidget /> {/* ✅ Add this here */}
    </>
  );
}

export default App;