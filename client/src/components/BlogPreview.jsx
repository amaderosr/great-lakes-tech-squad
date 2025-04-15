import React from 'react';

const posts = [
  {
    title: '5 Easy Wins for Small Business IT',
    excerpt: 'These quick tech upgrades will save time, money, and headaches.',
  },
  {
    title: 'What’s the Best Social Platform for You?',
    excerpt: 'We break down which networks matter most for your biz.',
  },
];

const BlogPreview = () => {
  return (
    <section className="bg-gray-100 py-16 px-4 text-center">
      <h2 className="text-3xl font-bold mb-12">From the Blog</h2>
      <div className="max-w-4xl mx-auto space-y-6">
        {posts.map((post, idx) => (
          <div key={idx} className="bg-white p-6 rounded shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
            <p className="text-gray-600">{post.excerpt}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BlogPreview;