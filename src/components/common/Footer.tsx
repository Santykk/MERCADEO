import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <Link to="/" className="flex items-center text-2xl font-bold mb-4">
              <ShoppingCart className="mr-2" />
              <span>MercadoApp</span>
            </Link>
            <p className="text-gray-300 mb-4">
              Tu tienda integral para todas tus compras. Encuentra los mejores productos a los mejores precios.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-blue-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-blue-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-white hover:text-blue-400 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-white hover:text-blue-400 transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white transition-colors">
                  Productos
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-300 hover:text-white transition-colors">
                  Categorias
                </Link>
              </li>
              <li>
                <Link to="/deals" className="text-gray-300 hover:text-white transition-colors">
                  Ofertas especiales
                </Link>
              </li>
              <li>
                <Link to="/sell" className="text-gray-300 hover:text-white transition-colors">
                  Vender con nosotros
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Servicio al cliente</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contactanos
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-300 hover:text-white transition-colors">
                  Información de envío
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-300 hover:text-white transition-colors">
                  Política de devoluciones
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">
                  Términos y condiciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contactanos</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-300">
                  123 E-Commerce St., Digital City, 10001
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-2 flex-shrink-0" />
                <span className="text-gray-300">(555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-2 flex-shrink-0" />
                <span className="text-gray-300">support@mercadoapp.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} MercadoApp. Todos los derechos reservados.
            </p>
            <div className="flex space-x-4">
              <Link to="/privacy" className="text-gray-400 text-sm hover:text-white transition-colors">
                Política de privacidad
              </Link>
              <Link to="/terms" className="text-gray-400 text-sm hover:text-white transition-colors">
                Términos de servicio
              </Link>
              <Link to="/cookies" className="text-gray-400 text-sm hover:text-white transition-colors">
                Política de cookies
              </Link>
            </div>
          </div>
        </div>

        {/* Footer pequeño */}
        <div className="mt-4 text-center">
          <p className="text-gray-400 text-sm">
           &copy; Desarrollado por Stringify Sudio
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
