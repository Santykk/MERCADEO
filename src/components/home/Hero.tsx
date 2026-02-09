import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  overlayColor: string;
}

const slides: HeroSlide[] = [
  {
    id: 1,
    image: 'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    title: 'Colección de joyas de lujo',
    subtitle: 'Descubra nuestra exclusiva selección de joyería fina',
    ctaText: 'Compra ahora',
    ctaLink: '/category/jewelry',
    overlayColor: 'from-gray-900/80 to-gray-600/50',
  },
  {
    id: 2,
    image: 'https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    title: 'Moda Primavera',
    subtitle: 'Nuevas llegadas para la temporada',
    ctaText: 'Explorar',
    ctaLink: '/category/womens-clothing',
    overlayColor: 'from-blue-900/80 to-blue-600/50',
  },
  {
    id: 3,
    image: 'https://images.pexels.com/photos/1342609/pexels-photo-1342609.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    title: 'Colección para hombre',
    subtitle: 'Mejora tu estilo con nuestra ropa masculina premium',
    ctaText: 'Colección de la tienda',
    ctaLink: '/category/mens-clothing',
    overlayColor: 'from-gray-900/80 to-gray-600/50',
  },
];

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToNextSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  const goToPrevSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  useEffect(() => {
    const interval = setInterval(goToNextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[400px] md:h-[500px] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <div className="relative h-full">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlayColor}`}></div>
            <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 text-white">
              <h1 className="text-3xl md:text-5xl font-bold mb-3 transform transition-transform duration-700 ease-out translate-y-0 opacity-100">
                {slide.title}
              </h1>
              <p className="text-lg md:text-xl mb-6 max-w-md transform transition-transform duration-700 ease-out delay-100 translate-y-0 opacity-100">
                {slide.subtitle}
              </p>
              <a
                href={slide.ctaLink}
                className="inline-block bg-white text-blue-600 font-medium py-2 px-6 rounded-md hover:bg-blue-50 transition-colors duration-300 transform transition-transform duration-700 ease-out delay-200 translate-y-0 opacity-100 w-fit"
              >
                {slide.ctaText}
              </a>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation buttons */}
      <button
        onClick={goToPrevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/30 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/50 transition-colors duration-300"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      
      <button
        onClick={goToNextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/30 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/50 transition-colors duration-300"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'w-8 bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default Hero;