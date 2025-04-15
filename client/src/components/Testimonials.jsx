import React from 'react';

const testimonials = [
  {
    name: 'Angela M.',
    role: 'Bakery Owner',
    quote: 'Great Lakes Tech Squad got my website back online in under an hour. Lifesavers!',
  },
  {
    name: 'Luis R.',
    role: 'Freelance Designer',
    quote: 'The social media automation they set up changed my entire workflow. 10/10.',
  },
  {
    name: 'Jessica H.',
    role: 'Gym Manager',
    quote: 'They helped us switch hardware and set up our office network. Fast and reliable!',
  },
];

const Testimonials = () => {
  return (
    <section className="bg-white py-16 px-4 text-center">
      <h2 className="text-3xl font-bold mb-12">What Our Clients Say</h2>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((t, idx) => (
          <div key={idx} className="bg-gray-50 p-6 rounded shadow hover:shadow-md transition">
            <p className="text-gray-700 italic mb-4">"{t.quote}"</p>
            <h4 className="font-bold">{t.name}</h4>
            <p className="text-sm text-gray-500">{t.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;