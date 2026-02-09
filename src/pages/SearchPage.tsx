import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import { Product } from '../types';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/products/ProductCard';

interface SearchFilters {
  category: string;
  minPrice: string;
  maxPrice: string;
  brand: string;
  sortBy: string;
  inStock: boolean;
}

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    minPrice: '',
    maxPrice: '',
    brand: '',
    sortBy: 'relevance',
    inStock: false,
  });

  const categories = [
    { id: 'f78c5ed5-d064-49cb-850f-8bd8bc4f08dc', name: 'Ropa' },
    { id: '610486ca-f06e-443e-a291-33da896dce41', name: 'Joyería' },
    { id: 'b112bffd-e2a2-45ee-bb7a-8761571cd050', name: 'Relojes' },
    { id: '781fbf1c-4d0d-4d2f-a667-cd1456498517', name: 'Bolsos' },
    { id: 'a984e494-e064-4385-b5aa-d8ccc3b4cf92', name: 'Ofertas' },
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevancia' },
    { value: 'price_low', label: 'Precio: Menor a Mayor' },
    { value: 'price_high', label: 'Precio: Mayor a Menor' },
    { value: 'rating', label: 'Mejor Puntuación' },
    { value: 'newest', label: 'Más Recientes' },
    { value: 'oldest', label: 'Más Antiguos' },
  ];

  // Load all products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Search by query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Filter by price range
    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      filtered = filtered.filter(product => {
        const price = product.discountPercentage
          ? product.price * (1 - product.discountPercentage / 100)
          : product.price;
        return price >= minPrice;
      });
    }

    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      filtered = filtered.filter(product => {
        const price = product.discountPercentage
          ? product.price * (1 - product.discountPercentage / 100)
          : product.price;
        return price <= maxPrice;
      });
    }

    // Filter by brand
    if (filters.brand) {
      filtered = filtered.filter(product =>
        product.brand?.toLowerCase().includes(filters.brand.toLowerCase())
      );
    }

    // Filter by stock
    if (filters.inStock) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    // Sort products
    switch (filters.sortBy) {
      case 'price_low':
        filtered.sort((a, b) => {
          const priceA = a.discountPercentage ? a.price * (1 - a.discountPercentage / 100) : a.price;
          const priceB = b.discountPercentage ? b.price * (1 - b.discountPercentage / 100) : b.price;
          return priceA - priceB;
        });
        break;
      case 'price_high':
        filtered.sort((a, b) => {
          const priceA = a.discountPercentage ? a.price * (1 - a.discountPercentage / 100) : a.price;
          const priceB = b.discountPercentage ? b.price * (1 - b.discountPercentage / 100) : b.price;
          return priceB - priceA;
        });
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime());
        break;
      default:
        // Relevance - keep original order or sort by title
        filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: searchQuery });
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      brand: '',
      sortBy: 'relevance',
      inStock: false,
    });
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buscar
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <SlidersHorizontal size={20} />
              Filtros
            </button>
          </form>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'resultado' : 'resultados'}
              {searchQuery && ` para "${searchQuery}"`}
            </span>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 bg-white rounded-lg shadow-sm p-6 h-fit">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Filtros</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rango de Precio
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Mín"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="flex-1 border border-gray-300 rounded px-3 py-2"
                    />
                    <input
                      type="number"
                      placeholder="Máx"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="flex-1 border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                </div>

                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca
                  </label>
                  <input
                    type="text"
                    placeholder="Buscar marca..."
                    value={filters.brand}
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>

                {/* Stock Filter */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Solo productos en stock</span>
                  </label>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={clearFilters}
                  className="w-full bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200 transition-colors"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Search size={48} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-gray-500 mb-4">
                  Intenta ajustar tus filtros o términos de búsqueda
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Limpiar Filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;