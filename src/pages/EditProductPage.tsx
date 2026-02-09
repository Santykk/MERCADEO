import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, ChevronDown, ChevronUp, Loader, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';
import toast from 'react-hot-toast';

const EditProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  const [imageFiles, setImageFiles] = useState<Record<string, File[]>>({});
  const [imagePreviews, setImagePreviews] = useState<Record<string, string[]>>({});
  const [mainImageIndex, setMainImageIndex] = useState<Record<string, number>>({});
  const [formData, setFormData] = useState<Record<string, Partial<Product>>>({});

  useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/');
      return;
    }
    fetchProducts();
  }, [userRole, navigate]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error('Failed to load products');
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, productId: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);

    setImageFiles(prev => ({
      ...prev,
      [productId]: [...(prev[productId] || []), ...newFiles],
    }));

    Promise.all(
      newFiles.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      })
    ).then(newPreviews => {
      setImagePreviews(prev => ({
        ...prev,
        [productId]: [...(prev[productId] || []), ...newPreviews],
      }));
    });

    e.target.value = '';
  };

  const handleRemoveImage = (productId: string, index: number) => {
    const updatedFiles = (imageFiles[productId] || []).filter((_, i) => i !== index);
    const updatedPreviews = (imagePreviews[productId] || []).filter((_, i) => i !== index);

    setImageFiles(prev => ({ ...prev, [productId]: updatedFiles }));
    setImagePreviews(prev => ({ ...prev, [productId]: updatedPreviews }));

    setMainImageIndex(prev => {
      const currentMainIndex = prev[productId] || 0;
      if (currentMainIndex === index) {
        return { ...prev, [productId]: 0 };
      }
      if (currentMainIndex > index) {
        return prev;
      }
      return prev;
    });
  };

  const handleRemoveExistingImage = async (productId: string, index: number) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const updatedImages = (product.images || []).filter((_, i) => i !== index);

      const { error } = await supabase
        .from('products')
        .update({ images: updatedImages })
        .eq('id', productId);

      if (error) throw error;

      setProducts(prev =>
        prev.map(p =>
          p.id === productId ? { ...p, images: updatedImages } : p
        )
      );

      setMainImageIndex(prev => {
        const currentMainIndex = prev[productId] || 0;
        if (currentMainIndex === index) {
          return { ...prev, [productId]: 0 };
        }
        if (currentMainIndex > index) {
          return prev;
        }
        return prev;
      });

      toast.success('Image removed successfully');
    } catch (error: any) {
      toast.error('Failed to remove image');
      console.error(error.message);
    }
  };

  const handleFieldChange = (
    productId: string,
    field: keyof Product,
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  const handleUpdateProduct = async (productId: string) => {
    const updatedData = formData[productId] || {};
    try {
      const files = imageFiles[productId] || [];
      const uploads: string[] = [];

      let imageUrls: string[] = products.find(p => p.id === productId)?.images || [];

      if (files.length > 0) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `products/${productId}/${Date.now()}-${Math.random()
            .toString(36)
            .substring(2)}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data } = supabase.storage.from('products').getPublicUrl(fileName);
          uploads.push(data.publicUrl);
        }
        imageUrls = [...imageUrls, ...uploads];
      }

      const mainIndex = mainImageIndex[productId] ?? 0;
      const thumbnail = imageUrls[mainIndex] || imageUrls[0] || '';

      const { error } = await supabase
        .from('products')
        .update({
          ...updatedData,
          thumbnail,
          images: imageUrls,
        })
        .eq('id', productId);

      if (error) throw error;

      toast.success('Product updated successfully');

      setEditingProduct(null);
      setImageFiles(prev => ({ ...prev, [productId]: [] }));
      setImagePreviews(prev => ({ ...prev, [productId]: [] }));
      setMainImageIndex(prev => ({ ...prev, [productId]: 0 }));
      setFormData(prev => ({ ...prev, [productId]: {} }));

      fetchProducts();
    } catch (error: any) {
      toast.error('Failed to update product');
      console.error(error.message);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este producto?');
    if (!confirmDelete) return;

    try {
      const product = products.find(p => p.id === productId);
      if (product) {
        // Eliminar imágenes del almacenamiento
        const imagesToDelete = product.images || [];
        for (const image of imagesToDelete) {
          const imagePath = image.split('/').pop(); // Obtener el nombre del archivo
          const { error: deleteError } = await supabase.storage
            .from('products')
            .remove([`products/${imagePath}`]);

          if (deleteError) throw deleteError;
        }
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast.success('Producto eliminado correctamente');
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error: any) {
      toast.error('No se pudo eliminar el producto');
      console.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  function formatPrice(value: number) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2
    }).format(value || 0);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Editar Productos</h1>

        {products.map((product) => {
          const previews = imagePreviews[product.id];
          const imagesToShow = previews && previews.length > 0 ? previews : product.images || [];
          const productForm = formData[product.id] || {};
          const title = productForm.title ?? product.title;
          const price = productForm.price ?? product.price;
          const stock = productForm.stock ?? product.stock;
          const category = productForm.category ?? product.category;
          const description = productForm.description ?? product.description;
          const brand = productForm.brand ?? product.brand;
          const discountPercentage = productForm.discount_percentage ?? product.discount_percentage;

          return (
            <div
              key={product.id}
              className="bg-white p-6 rounded-2xl shadow-md mb-6 transition hover:shadow-lg"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-5">
                  <img
                    src={product.thumbnail || (imagesToShow[0] ?? '')}
                    alt={title}
                    className="w-24 h-24 object-cover rounded-xl border-2 border-gray-300"
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                    <p className="text-blue-600 text-sm font-medium">{formatPrice(price)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className="text-blue-600 hover:text-blue-800 transition"
                    onClick={() =>
                      setEditingProduct(editingProduct === product.id ? null : product.id)
                    }
                    aria-label={editingProduct === product.id ? 'Cerrar edición' : 'Editar producto'}
                  >
                    {editingProduct === product.id ? <ChevronUp /> : <Edit2 />}
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800 transition"
                    onClick={() => handleDeleteProduct(product.id)}
                    aria-label="Eliminar producto"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {editingProduct === product.id && (
                <div className="mt-6 border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={title}
                        onChange={e => handleFieldChange(product.id, 'title', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={price}
                        onChange={e =>
                          handleFieldChange(product.id, 'price', parseFloat(e.target.value))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock
                      </label>
                      <input
                        type="number"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={stock}
                        onChange={e =>
                          handleFieldChange(product.id, 'stock', parseInt(e.target.value, 10))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categoría
                      </label>
                      <select
                        value={category || ''}
                        onChange={e => handleFieldChange(product.id, 'category', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="">Selecciona una categoría</option>
                        <option value="f78c5ed5-d064-49cb-850f-8bd8bc4f08dc">Ropa</option>
                        <option value="610486ca-f06e-443e-a291-33da896dce41">Joyería</option>
                        <option value="b112bffd-e2a2-45ee-bb7a-8761571cd050">Relojes</option>
                        <option value="781fbf1c-4d0d-4d2f-a667-cd1456498517">Bolsos</option>
                        <option value="a984e494-e064-4385-b5aa-d8ccc3b4cf92">Ofertas</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Marca
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={brand || ''}
                        onChange={e => handleFieldChange(product.id, 'brand', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descuento (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={discountPercentage || ''}
                        onChange={e =>
                          handleFieldChange(product.id, 'discount_percentage', parseFloat(e.target.value))
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={description || ''}
                      onChange={e => handleFieldChange(product.id, 'description', e.target.value)}
                    />
                  </div>

                  {/* Image uploader */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imágenes del producto
                    </label>

                    <label
                      htmlFor={`image-upload-${product.id}`}
                      className="inline-block cursor-pointer rounded-lg border-2 border-dashed border-gray-400 px-6 py-4 text-center text-gray-600 hover:bg-gray-50 transition"
                      aria-label="Agregar imágenes"
                    >
                      Seleccionar imágenes
                    </label>
                    <input
                      id={`image-upload-${product.id}`}
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleImageChange(e, product.id)}
                    />

                    <div className="flex flex-wrap mt-4 gap-4 max-w-full overflow-x-auto">
                      {/* Existing images from product */}
                      {product.images?.map((img, idx) => (
                        <div
                          key={`existing-${idx}`}
                          className={`relative border rounded-lg overflow-hidden cursor-pointer
                            ${
                              mainImageIndex[product.id] === idx
                                ? 'border-blue-500 ring-2 ring-blue-400'
                                : 'border-gray-300'
                            }
                          `}
                          onClick={() =>
                            setMainImageIndex(prev => ({ ...prev, [product.id]: idx }))
                          }
                          title={
                            mainImageIndex[product.id] === idx
                              ? 'Imagen principal'
                              : 'Seleccionar como imagen principal'
                          }
                        >
                          <img
                            src={img}
                            alt={`Imagen ${idx + 1}`}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          {mainImageIndex[product.id] === idx && (
                            <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs font-semibold px-1 rounded">
                              principal
                            </span>
                          )}
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleRemoveExistingImage(product.id, idx);
                            }}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700"
                            aria-label="Eliminar imagen"
                            type="button"
                          >
                            ×
                          </button>
                        </div>
                      ))}

                      {/* New uploaded images previews */}
                      {(imagePreviews[product.id] || []).map((preview, idx) => (
                        <div
                          key={`preview-${idx}`}
                          className={`relative border rounded-lg overflow-hidden cursor-pointer
                            ${
                              mainImageIndex[product.id] === (product.images?.length || 0) + idx
                                ? 'border-green-500 ring-2 ring-green-400'
                                : 'border-gray-300'
                            }
                          `}
                          onClick={() =>
                            setMainImageIndex(prev => ({
                              ...prev,
                              [product.id]: (product.images?.length || 0) + idx,
                            }))
                          }
                          title={
                            mainImageIndex[product.id] === (product.images?.length || 0) + idx
                              ? 'Imagen principal'
                              : 'Seleccionar como imagen principal'
                          }
                        >
                          <img
                            src={preview}
                            alt={`Nueva imagen ${idx + 1}`}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleRemoveImage(product.id, idx);
                            }}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700"
                            aria-label="Eliminar imagen"
                            type="button"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="rounded-md bg-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-400 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleUpdateProduct(product.id)}
                      className="rounded-md bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 transition"
                    >
                      Guardar cambios
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EditProductPage;