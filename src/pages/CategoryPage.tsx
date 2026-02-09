import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProducts } from '../lib/products'; // Cambia según tu estructura
import { Product } from '../types';
import ProductCard from '../components/products/ProductCard';

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams(); // Esto obtiene el ID desde la URL
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndFilterProducts = async () => {
      try {
        const allProducts = await getProducts();
        const filtered = allProducts.filter(
          (product: Product) => product.category === categoryId
        );
        setFilteredProducts(filtered);
      } catch (error) {
        console.error('Error al cargar productos por categoría:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilterProducts();
  }, [categoryId]);

  if (loading) return <p className="text-center mt-10">Cargando productos...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Productos de la Categoría</h1>

      {filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500">No hay productos en esta categoría.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
