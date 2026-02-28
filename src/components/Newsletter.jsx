import React, { useState } from 'react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-12 sm:px-12 sm:py-16 lg:py-20 lg:px-16">
            <div className="lg:flex lg:items-center lg:justify-between">
              <div className="lg:w-0 lg:flex-1">
                <h2 className="text-3xl font-bold text-white">Subscribe to our newsletter</h2>
                <p className="mt-4 max-w-3xl text-lg text-red-100">
                  Get exclusive deals and £5 off your first order over £30
                </p>
              </div>
              
              <div className="mt-8 lg:mt-0 lg:ml-8">
                {submitted ? (
                  <div className="bg-red-700 rounded-md p-4 text-white">
                    <p className="font-medium">Thank you for subscribing!</p>
                    <p className="text-sm mt-1">Check your email for your £5 discount code</p>
                  </div>
                ) : (
                  <form className="sm:flex" onSubmit={handleSubmit}>
                    <div className="flex-1 min-w-0">
                      <label htmlFor="email" className="sr-only">Email address</label>
                      <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full px-5 py-3 text-base rounded-md border-0 text-gray-900 placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-700 focus:ring-white"
                        required
                      />
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <button
                        type="submit"
                        className="block w-full py-3 px-4 rounded-md shadow bg-yellow-400 text-red-900 font-medium hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-700 focus:ring-yellow-400 transition-colors"
                      >
                        Subscribe
                      </button>
                    </div>
                  </form>
                )}
                <p className="mt-3 text-sm text-red-200">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;