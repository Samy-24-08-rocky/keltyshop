import React from 'react';
import { FiAward } from 'react-icons/fi';

const LoyaltyBadge = ({ points }) => {
  const getLevel = () => {
    if (points >= 1000) return { name: 'Platinum', color: 'from-gray-700 to-gray-900' };
    if (points >= 500) return { name: 'Gold', color: 'from-yellow-600 to-yellow-500' };
    if (points >= 200) return { name: 'Silver', color: 'from-gray-300 to-gray-400' };
    return { name: 'Bronze', color: 'from-yellow-800 to-yellow-700' };
  };

  const level = getLevel();

  return (
    <div className="flex items-center bg-white rounded-full shadow-sm px-4 py-2">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r ${level.color} text-white`}>
        <FiAward />
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium">{level.name} Member</p>
        <p className="text-xs text-gray-500">{points} points</p>
      </div>
    </div>
  );
};

export default LoyaltyBadge;