import React from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
//import Blog from './components/Blog'; 
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';

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
      //<Blog />
      <ContactForm />
      <Footer />
    </>
  );
}

export default App;