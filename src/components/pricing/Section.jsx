import React from 'react';

export default function Section({ id, title, children }) {
  return (
    <section id={id} className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold tracking-tight sm:text-4xl gold-text-gradient">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}