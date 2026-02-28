import React from 'react';

const About = () => {
  return (
    <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">About Kelty's Mini Market</h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-600">
            Your neighborhood market since 1995
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2">
            <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl overflow-hidden shadow-xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">Our Story</h2>
              <p className="mb-4">
                Kelty's Mini Market was founded in 1995 by the Kelty family with a simple mission: 
                to be the friendly neighborhood market where quality meets convenience. What started 
                as a small corner store has grown into a beloved community staple serving generations 
                of families.
              </p>
              <p>
                For over 25 years, we've been committed to providing fresh, quality products with 
                the personal service you can only find at a family-owned market.
              </p>
            </div>
          </div>
          
          <div className="md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1607082350899-7e105aa886ae?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" 
              alt="Kelty's Mini Market exterior" 
              className="rounded-2xl shadow-xl"
            />
          </div>
        </div>
        
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-center text-white mb-4">
                ✓
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Quality First</h3>
              <p className="text-gray-600">
                We source only the freshest produce and highest quality products, carefully selected 
                for our customers.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-center text-white mb-4">
                ♻
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Community Focus</h3>
              <p className="text-gray-600">
                Supporting local farmers and producers while being an active part of our neighborhood.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-center text-white mb-4">
                ⏱
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Convenience</h3>
              <p className="text-gray-600">
                Easy shopping experience with friendly service and essentials always in stock.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-center text-white mb-4">
                ❤
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Family Values</h3>
              <p className="text-gray-600">
                Treating every customer like family with personal service you can count on.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-16 bg-gradient-to-r from-red-50 to-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-center mb-8">Our Team</h2>
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/3 flex justify-center">
              <div className="relative">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" 
                    alt="Robert Kelty" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow">
                  Robert Kelty, Owner
                </div>
              </div>
            </div>
            
            <div className="md:w-2/3">
              <p className="text-lg text-gray-700">
                "At Kelty's, we're not just a store - we're part of the neighborhood family. Our team 
                of dedicated staff knows our customers by name and takes pride in helping you find 
                exactly what you need. From our butchers who hand-select the finest cuts, to our 
                produce experts who ensure only the freshest items make it to our shelves, everyone 
                at Kelty's is committed to making your shopping experience exceptional."
              </p>
              <p className="mt-4 text-gray-600">
                Stop by today and experience the Kelty's difference - where quality, value, and 
                friendly service come together in your neighborhood market.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <div className="inline-block bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-3 rounded-full font-medium">
            Visit us at: 46 Main St, Kelty KY4 0AE, United Kingdom
          </div>
          <p className="mt-4 text-gray-600">
            Open Monday-Friday: 7am-9pm | Saturday-Sunday: 8am-8pm
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;