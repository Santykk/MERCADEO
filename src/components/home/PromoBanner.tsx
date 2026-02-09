import React from 'react';
import { Truck, Shield, CreditCard, LifeBuoy } from 'lucide-react';

const BannerPromocional: React.FC = () => {
  const beneficios = [
    {
      icon: <Truck size={48} className="mb-4 text-blue-600" />,
      title: 'Envío Gratis',
      description: 'En pedidos superiores a $50.000',
    },
    {
      icon: <Shield size={48} className="mb-4 text-blue-600" />,
      title: 'Pagos Seguros',
      description: 'Pago 100% seguro',
    },
    {
      icon: <CreditCard size={48} className="mb-4 text-blue-600" />,
      title: 'Devoluciones Fáciles',
      description: 'Política de devolución de 30 días',
    },
    {
      icon: <LifeBuoy size={48} className="mb-4 text-blue-600" />,
      title: 'Soporte 24/7',
      description: 'Siempre estamos para ayudarte',
    },
  ];

  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {beneficios.map((beneficio, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm transition-transform duration-300 hover:shadow-md hover:-translate-y-1"
            >
              {beneficio.icon}
              <h3 className="text-lg font-semibold mb-2">{beneficio.title}</h3>
              <p className="text-gray-600">{beneficio.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BannerPromocional;