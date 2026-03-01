// src/pages/Home.jsx
import React from 'react';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import FeaturedProducts from '../components/FeaturedProducts';
import RotatingHotSpots from '../components/RotatingHotSpots';
import { useAdmin } from '../context/AdminContext';
import WeeklyDeals from '../components/WeeklyDeals';
import Testimonials from '../components/Testimonials';

const Home = ({ addToCart }) => {
  const { settings } = useAdmin();
  const m = settings?.merchandising ?? {};

  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts addToCart={addToCart} />
      {m.showHotSpots && <RotatingHotSpots addToCart={addToCart} />}
      <WeeklyDeals addToCart={addToCart} />
      <Testimonials />
    </>
  );
};

export default Home;