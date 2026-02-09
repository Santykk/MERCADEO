import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
}

interface CategoryAttribute {
  id: string;
  name: string;
  type: 'select' | 'text' | 'checkbox';
  values: string | null;
  required: boolean;
}

const CreateProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryAttributes, setCategoryAttributes] = useState<CategoryAttribute[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);
  const [attributeValues, setAttributeValues] = useState<{ [key: string]: any }>({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    brand: '',
    category: '',
    stock: '',
    discountPercentage: ''
  });

  useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/');
    }
    loadCategories();
  }, [userRole, navigate]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      toast.error('Error loading categories');
      console.error(error);
    }
  };

  const loadCategoryAttributes = async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('category_attributes')
        .select('id, name, type, values, required')
        .eq('category_id', categoryId)
        .order('name');

      if (error) throw error;
      setCategoryAttributes(data || []);
      setAttributeValues({});
    } catch (error) {
      toast.error('Error loading attributes');
      console.error(error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);

    setImageFiles(prev => [...prev, ...fileArray]);

    const readers = fileArray.map(file => {
      return new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(results => {
      setImagePreviews(prev => [...prev, ...results]);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'category' && value) {
      loadCategoryAttributes(value);
    } else if (name === 'category') {
      setCategoryAttributes([]);
      setAttributeValues({});
    }
  };

  const handleAttributeChange = (attributeId: string, value: any) => {
    setAttributeValues(prev => ({ ...prev, [attributeId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      toast.error("Por favor sube al menos una imagen.");
      return;
    }

    const requiredAttributes = categoryAttributes.filter(attr => attr.required);
    for (const attr of requiredAttributes) {
      if (!attributeValues[attr.id]) {
        toast.error(`${attr.name} is required`);
        return;
      }
    }

    setLoading(true);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, file, { upsert: false });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        if (!data?.publicUrl) throw new Error("No se pudo obtener la URL pública.");

        uploadedUrls.push(data.publicUrl);
      }

      const thumbnailUrl = uploadedUrls[mainImageIndex] || uploadedUrls[0];

      const productData: any = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        brand: formData.brand || null,
        category: formData.category || null,
        stock: parseInt(formData.stock),
        thumbnail: thumbnailUrl,
        images: uploadedUrls,
      };

      if (formData.discountPercentage) {
        productData.discount_percentage = parseFloat(formData.discountPercentage);
      }

      const { data: product, error: insertError } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .maybeSingle();

      if (insertError) throw insertError;

      if (product && Object.keys(attributeValues).length > 0) {
        const productAttributeData = Object.entries(attributeValues)
          .filter(([_, value]) => value)
          .map(([attrId, value]) => ({
            product_id: product.id,
            attribute_id: attrId,
            value: Array.isArray(value) ? value.join(',') : String(value)
          }));

        if (productAttributeData.length > 0) {
          const { error: attrError } = await supabase
            .from('product_attributes')
            .insert(productAttributeData);

          if (attrError) throw attrError;
        }
      }

      toast.success('¡Producto creado exitosamente!');
      navigate('/admin/edit-product');
    } catch (error: any) {
      console.error('Error creando producto:', error);
      toast.error(error.message || 'Error al crear el producto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold mb-8 text-gray-900">Crear nuevo producto </h1>
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-8">
            {/* Imágenes */}
            <div>
              <label className="block text-md font-semibold text-gray-700 mb-3">Imágenes del producto</label>
              <div className="flex flex-wrap gap-4 mb-4">
                {imagePreviews.map((src, idx) => (
                  <div key={idx} className="relative cursor-pointer">
                    <img
                      src={src}
                      alt={`Preview ${idx}`}
                      className={`h-24 w-24 object-cover rounded-lg border-4 transition-colors duration-300 ${idx === mainImageIndex ? 'border-blue-600' : 'border-transparent hover:border-gray-300'}`}
                      onClick={() => setMainImageIndex(idx)}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImagePreviews(prev => prev.filter((_, i) => i !== idx));
                        setImageFiles(prev => prev.filter((_, i) => i !== idx));
                        setMainImageIndex(prev => {
                          if (idx === prev) return 0;
                          return prev > idx ? prev - 1 : prev;
                        });
                      }}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs font-bold hover:bg-red-700 flex items-center justify-center"
                      aria-label="Eliminar imagen"
                    >
                      ×
                    </button>
                    {idx === mainImageIndex && (
                      <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1 rounded select-none">Principal</div>
                    )}
                  </div>
                ))}
              </div>
              <label className="inline-block cursor-pointer border-2 border-dashed border-gray-400 px-6 py-4 rounded-lg hover:bg-gray-100 text-center text-gray-600 font-semibold">
                Subir archivos
                <input
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />
              </label>
            </div>

            {/* Campos formulario */}
            <div>
              <label className="block text-md font-semibold text-gray-700 mb-2">Título</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
            </div>

            <div>
              <label className="block text-md font-semibold text-gray-700 mb-2">Descripción</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" rows={4} required />
            </div>

            <div>
              <label className="block text-md font-semibold text-gray-700 mb-2">Precio</label>
              <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" step="0.01" min="0" required />
            </div>

            <div>
              <label className="block text-md font-semibold text-gray-700 mb-2">Marca</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-md font-semibold text-gray-700 mb-2">Categoría</label>
              <select name="category" value={formData.category} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Selecciona una categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {categoryAttributes.length > 0 && (
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Atributos del producto</h3>
                <div className="space-y-4">
                  {categoryAttributes.map(attr => (
                    <div key={attr.id}>
                      <label className="block text-md font-semibold text-gray-700 mb-2">
                        {attr.name}
                        {attr.required && <span className="text-red-500"> *</span>}
                      </label>

                      {attr.type === 'select' && attr.values && (
                        <select
                          value={attributeValues[attr.id] || ''}
                          onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select {attr.name}</option>
                          {attr.values.split(',').map(val => (
                            <option key={val.trim()} value={val.trim()}>{val.trim()}</option>
                          ))}
                        </select>
                      )}

                      {attr.type === 'text' && (
                        <input
                          type="text"
                          placeholder={`Enter ${attr.name}`}
                          value={attributeValues[attr.id] || ''}
                          onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      )}

                      {attr.type === 'checkbox' && attr.values && (
                        <div className="mt-1 space-y-2">
                          {attr.values.split(',').map(val => (
                            <label key={val.trim()} className="flex items-center">
                              <input
                                type="checkbox"
                                value={val.trim()}
                                checked={(attributeValues[attr.id] || []).includes(val.trim())}
                                onChange={(e) => {
                                  const currentValues = attributeValues[attr.id] || [];
                                  if (e.target.checked) {
                                    handleAttributeChange(attr.id, [...currentValues, val.trim()]);
                                  } else {
                                    handleAttributeChange(attr.id, currentValues.filter((v: string) => v !== val.trim()));
                                  }
                                }}
                                className="mr-2"
                              />
                              <span className="text-gray-700">{val.trim()}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-md font-semibold text-gray-700 mb-2">Cantidad disponible</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" min="0" required />
            </div>

            <div>
              <label className="block text-md font-semibold text-gray-700 mb-2">Porcentaje de descuento</label>
              <input type="number" name="discountPercentage" value={formData.discountPercentage} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md p-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" step="0.01" min="0" max="100" />
            </div>

            <div className="flex justify-end space-x-4">
              <button type="button" onClick={() => navigate('/admin/edit-product')} className="px-5 py-3 border border-gray-300 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-100">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? <Loader className="animate-spin h-5 w-5 mr-2" /> : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProductPage;