import React from 'react';
import { Link } from 'react-router-dom';

const CategoriesPage = () => {
  const categories = [
    { id: 1, name: 'Condiments & Sauces', icon: '🍯', count: 120, description: 'Ketchup, mayo, sauces and dressings' },
    { id: 2, name: 'Dairy & Eggs', icon: '🥚', count: 85, description: 'Farm-fresh dairy products' },
    { id: 3, name: 'Meat & Seafood', icon: '🍗', count: 65, description: 'Premium quality meats and seafood' },
    { id: 4, name: 'Bakery', icon: '🍞', count: 42, description: 'Freshly baked bread and pastries' },
    { id: 5, name: 'Beverages', icon: '🥤', count: 96, description: 'Refreshing drinks and juices' },
    { id: 6, name: 'Snacks', icon: '🍪', count: 112, description: 'Delicious snacks for every craving' },
    { id: 7, name: 'Frozen Foods', icon: '❄️', count: 78, description: 'Convenient frozen meals and ingredients' },
    { id: 8, name: 'Pantry Staples', icon: '🍚', count: 95, description: 'Essential cooking ingredients' },
    { id: 9, name: 'Organic', icon: '🌿', count: 64, description: 'Certified organic products' },
    { id: 10, name: 'International', icon: '🌎', count: 87, description: 'Global cuisine ingredients' },
    { id: 11, name: 'Health & Wellness', icon: '💊', count: 53, description: 'Vitamins and supplements' },
    { id: 12, name: 'Baby Care', icon: '👶', count: 47, description: 'Products for your little ones' },
  ];

  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">All Categories</h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-600">
            Browse our full selection of grocery categories
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
              className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-red-200 transition-all"
            >
              <div className="flex items-center">
                <div className="mr-4 h-16 w-16 flex items-center justify-center rounded-full bg-red-50 text-3xl group-hover:bg-red-100 transition-colors">
                  {category.icon}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-red-700 transition-colors">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{category.count} products</p>
                </div>
              </div>
              <p className="mt-4 text-gray-600 text-sm">{category.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;