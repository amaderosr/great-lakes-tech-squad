import React from 'react';

const Hero = () => {
  return (
    <section className="bg-gradient-to-r from-blue-700 to-blue-500 text-white py-20 px-4 text-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-4">Remote Technical Support You Can Trust</h1>
      <p className="text-xl mb-6 max-w-3xl mx-auto">
        Small business? Tech trouble? Great Lakes Tech Squad has your back with websites, hardware & social strategy.
      </p>
      <a
        href="#contact"
        className="bg-white text-blue-700 font-semibold px-6 py-3 rounded hover:bg-gray-200 transition"
      >
        Get Support Now
      </a>
    </section>
  );
};

export default Hero;