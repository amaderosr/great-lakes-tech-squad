import React from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Testimonials from './components/Testimonials';

import ContactForm from './components/ContactForm';


function App() {
  return (
    <>
      {/* 🔥 Global toaster notification system */}
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />

      {/* 🧩 Page layout components */}
      <Navbar />
      <Hero />
      <Services />
      <Testimonials />
      
      <ContactForm />
      
    </>
  );
}

export default App;