import React, { useState } from 'react';

const AIHelpWidget = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const handleSubmit = () => {
    alert(`Your message has been logged:\n"${query}"\n\n(This will soon go to email/CRM!)`);
    setQuery('');
    setOpen(false);
  };

  return (
    <>
      <button
        className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-xl hover:bg-green-700"
        onClick={() => setOpen(!open)}
      >
        🤖
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 bg-white p-4 rounded shadow-lg w-72">
          <textarea
            className="w-full border px-2 py-1 rounded mb-2"
            placeholder="How can we help?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 transition"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      )}
    </>
  );
};

export default AIHelpWidget;