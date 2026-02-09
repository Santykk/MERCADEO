import React from 'react';
import Hero from '../components/home/Hero';
import CategoryList from '../components/products/CategoryList';
import FeaturedProducts from '../components/home/FeaturedProducts';
import PromoBanner from '../components/home/PromoBanner';
import { categories, products } from '../data/mockData';

const HomePage: React.FC = () => {
  // Get a subset of products for featured and discounted sections
  const featuredProducts = products.slice(0, 4);
  const discountedProducts = products.filter(p => p.discountPercentage).slice(0, 4);
  
  return (
    <div>
      <Hero />
      
      <div className="container mx-auto px-4">
        <CategoryList categories={categories} />
        
        <FeaturedProducts products={featuredProducts} title="Featured Products" />
        
        {/* Promotional Banner with Benefits */}
        <PromoBanner />
        
        {/* Discounted Products Section */}
        <FeaturedProducts products={discountedProducts} title="Special Deals" />
        
        {/* Call-to-action Banner */}
        <div className="my-12 bg-blue-600 text-white rounded-xl overflow-hidden">
          <div className="flex flex-col md:flex-row items-center">
            <div className="p-8 md:p-12 flex-1">
              <h2 className="text-3xl font-bold mb-4">Conviértase en vendedor hoy</h2>
              <p className="mb-6 text-blue-100">
Únete a miles de vendedores que ya están expandiendo su negocio con MercadoApp.
Accede a millones de clientes y empieza a vender en minutos.
              </p>
              <a
                href="/sell"
                className="inline-block bg-white text-blue-600 font-medium py-2 px-6 rounded-md hover:bg-blue-50 transition-colors duration-300"
              >
                Empezar a vender
              </a>
            </div>
            <div className="flex-1 h-64 md:h-auto relative">
              <img
                src="https://images.pexels.com/photos/6214476/pexels-photo-6214476.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Become a seller"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;