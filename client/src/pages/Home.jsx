import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Services from "../components/Services";
import About from "../components/About";
import Testimonials from "../components/Testimonials";
import BlogPreview from "../components/BlogPreview";
import ContactForm from "../components/ContactForm";
import AIHelpWidget from "../components/AIHelpWidget";

const Home = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <Services />
      <About />
      <Testimonials />
      <BlogPreview />
      <ContactForm />
      <AIHelpWidget />
    </div>
  );
};

export default Home;