import React from 'react';

const services = [
  {
    title: 'Hardware & Network Setup',
    desc: 'Expert help with routers, printers, security & more.',
    icon: '🛠️',
  },
  {
    title: 'Website Help',
    desc: 'Fix bugs, build sites, or boost your performance.',
    icon: '🌐',
  },
  {
    title: 'Social Marketing',
    desc: 'Strategic content, account setup & automation.',
    icon: '📱',
  },
];

const Services = () => {
  return (
    <section className="py-16 px-4 bg-gray-100 text-center">
      <h2 className="text-3xl font-bold mb-12">Our Services</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {services.map((service, idx) => (
          <div key={idx} className="bg-white p-6 rounded shadow hover:shadow-lg transition">
            <div className="text-4xl mb-4">{service.icon}</div>
            <h3 className="text-xl font-semibold">{service.title}</h3>
            <p className="text-gray-600 mt-2">{service.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;