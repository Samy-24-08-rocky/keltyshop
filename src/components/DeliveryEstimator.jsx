import React, { useState, useEffect } from 'react';
import { FiClock, FiMapPin } from 'react-icons/fi';

const DeliveryEstimator = ({ postalCode }) => {
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDeliveryOptions([
        {
          id: 1,
          type: 'Standard',
          price: 3.99,
          eta: '2-3 days',
          description: 'Delivered by Royal Mail'
        },
        {
          id: 2,
          type: 'Express',
          price: 6.99,
          eta: 'Next day',
          description: 'Order before 3pm'
        },
        {
          id: 3,
          type: 'Same Day',
          price: 9.99,
          eta: 'Today by 9pm',
          description: 'Order before 1pm'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, [postalCode]);

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 p-4 border-b">
        <h3 className="font-medium flex items-center">
          <FiMapPin className="mr-2 text-red-500" />
          Delivery to: {postalCode || 'KY4 0AW'}
        </h3>
      </div>
      
      <div className="p-4">
        {deliveryOptions.map(option => (
          <div 
            key={option.id}
            className={`p-4 border rounded-lg mb-3 cursor-pointer transition-colors ${
              selectedOption?.id === option.id 
                ? 'border-red-500 bg-red-50' 
                : 'hover:border-red-300'
            }`}
            onClick={() => setSelectedOption(option)}
          >
            <div className="flex justify-between">
              <div>
                <h4 className="font-medium">{option.type} Delivery</h4>
                <p className="text-sm text-gray-500">{option.description}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">£{option.price.toFixed(2)}</p>
                <p className="text-sm text-gray-500 flex items-center justify-end">
                  <FiClock className="mr-1" /> {option.eta}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">
            Orders over £30 qualify for <span className="font-medium">FREE Standard Delivery</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryEstimator;