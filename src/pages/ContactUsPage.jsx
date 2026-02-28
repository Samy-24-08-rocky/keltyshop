// src/pages/ContactUsPage.jsx
import React, { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send this data to your backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    
    // Reset submission status after 5 seconds
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">Contact Us</h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
          We'd love to hear from you! Reach out with any questions or feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-gray-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
          
          <div className="space-y-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <FiPhone className="w-6 h-6" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Call Us</h3>
                <p className="mt-1 text-gray-600">+44 (0) 1234 567890</p>
                <p className="text-gray-600">Mon-Fri, 9am-5pm GMT</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <FiMail className="w-6 h-6" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Email Us</h3>
                <p className="mt-1 text-gray-600">info@keltminimarket.com</p>
                <p className="text-gray-600">We reply within 24 hours</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <FiMapPin className="w-6 h-6" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Visit Us</h3>
                <p className="mt-1 text-gray-600">Main Street</p>
                <p className="text-gray-600">Kelty, KY4 0AW</p>
              </div>
            </div>
          </div>
          
          <div className="mt-10">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Store Hours</h3>
            <div className="space-y-2">
              <p className="flex justify-between text-gray-600">
                <span>Monday - Friday</span>
                <span>8:00 AM - 8:00 PM</span>
              </p>
              <p className="flex justify-between text-gray-600">
                <span>Saturday</span>
                <span>9:00 AM - 7:00 PM</span>
              </p>
              <p className="flex justify-between text-gray-600">
                <span>Sunday</span>
                <span>10:00 AM - 6:00 PM</span>
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
          
          {submitted ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h3 className="text-xl font-medium text-red-800">Message Sent!</h3>
              <p className="mt-2 text-red-700">
                Thank you for contacting us. We'll get back to you soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              
              <div>
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <FiSend className="mr-2" />
                  Send Message
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      <div className="mt-16 rounded-2xl overflow-hidden">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2248.358589775292!2d-3.3824852843350185!3d56.1337992!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48865a3e1e3a78a7%3A0x1a5c1a7a7f4d0b1e!2sKelty%2C%20KY4%200AW!5e0!3m2!1sen!2suk!4v171717171717"
          width="100%" 
          height="450" 
          style={{ border: 0 }} 
          allowFullScreen="" 
          loading="lazy" 
          title="Kelty Mini Market Location"
        ></iframe>
      </div>
    </div>
  );
};

export default ContactUsPage;