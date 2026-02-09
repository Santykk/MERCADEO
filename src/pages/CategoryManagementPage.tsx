import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface Attribute {
  id?: string;
  name: string;
  type: 'select' | 'text' | 'checkbox';
  values: string;
  required: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  attributes?: Attribute[];
}

const CategoryManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newAttribute, setNewAttribute] = useState<{ [key: string]: Attribute }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          description,
          category_attributes (
            id,
            name,
            type,
            values,
            required
          )
        `)
        .order('name');

      if (error) throw error;

      setCategories(data || []);
    } catch (error) {
      toast.error('Error loading categories');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .insert([newCategory]);

      if (error) throw error;

      toast.success('Category created successfully');
      setNewCategory({ name: '', description: '' });
      setIsAddingCategory(false);
      loadCategories();
    } catch (error) {
      toast.error('Error creating category');
      console.error(error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Category deleted successfully');
      loadCategories();
    } catch (error) {
      toast.error('Error deleting category');
      console.error(error);
    }
  };

  const handleAddAttribute = async (categoryId: string) => {
    const attr = newAttribute[categoryId];

    if (!attr || !attr.name.trim()) {
      toast.error('Attribute name is required');
      return;
    }

    if (attr.type === 'select' && !attr.values.trim()) {
      toast.error('At least one value is required for select type');
      return;
    }

    try {
      const { error } = await supabase
        .from('category_attributes')
        .insert([{
          category_id: categoryId,
          name: attr.name,
          type: attr.type,
          values: attr.type === 'select' ? attr.values : null,
          required: attr.required
        }]);

      if (error) throw error;

      toast.success('Attribute added successfully');
      setNewAttribute(prev => {
        const newState = { ...prev };
        delete newState[categoryId];
        return newState;
      });
      loadCategories();
    } catch (error) {
      toast.error('Error adding attribute');
      console.error(error);
    }
  };

  const handleDeleteAttribute = async (attributeId: string) => {
    if (!confirm('Are you sure you want to delete this attribute?')) return;

    try {
      const { error } = await supabase
        .from('category_attributes')
        .delete()
        .eq('id', attributeId);

      if (error) throw error;

      toast.success('Attribute deleted successfully');
      loadCategories();
    } catch (error) {
      toast.error('Error deleting attribute');
      console.error(error);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Categories</h1>
        {!isAddingCategory && (
          <button
            onClick={() => setIsAddingCategory(true)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Add Category
          </button>
        )}
      </div>

      {isAddingCategory && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-2 border-blue-200">
          <h2 className="text-xl font-semibold mb-4">Create New Category</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Category name"
              value={newCategory.name}
              onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <textarea
              placeholder="Category description (optional)"
              value={newCategory.description}
              onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddCategory}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Create Category
              </button>
              <button
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategory({ name: '', description: '' });
                }}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
                  {category.description && (
                    <p className="text-gray-600 mt-1">{category.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(category.id);
                    }}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                  {expandedCategory === category.id ? (
                    <ChevronUp size={24} className="text-blue-600" />
                  ) : (
                    <ChevronDown size={24} className="text-gray-400" />
                  )}
                </div>
              </div>

              {expandedCategory === category.id && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Attributes</h4>

                  {category.attributes && category.attributes.length > 0 && (
                    <div className="space-y-2 mb-6">
                      {category.attributes.map((attr) => (
                        <div key={attr.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{attr.name}</p>
                            <p className="text-sm text-gray-500">
                              Type: {attr.type} {attr.required && '(Required)'}
                            </p>
                            {attr.values && (
                              <p className="text-sm text-gray-500">Values: {attr.values}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteAttribute(attr.id!)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-3">Add New Attribute</h5>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Attribute name (e.g., Size, Color)"
                        value={newAttribute[category.id]?.name || ''}
                        onChange={(e) => setNewAttribute(prev => ({
                          ...prev,
                          [category.id]: { ...prev[category.id], name: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />

                      <select
                        value={newAttribute[category.id]?.type || 'select'}
                        onChange={(e) => setNewAttribute(prev => ({
                          ...prev,
                          [category.id]: { ...prev[category.id], type: e.target.value as any }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="select">Select (dropdown list)</option>
                        <option value="text">Text Input</option>
                        <option value="checkbox">Checkboxes</option>
                      </select>

                      {newAttribute[category.id]?.type !== 'text' && (
                        <input
                          type="text"
                          placeholder="Values separated by commas (e.g., S,M,L,XL)"
                          value={newAttribute[category.id]?.values || ''}
                          onChange={(e) => setNewAttribute(prev => ({
                            ...prev,
                            [category.id]: { ...prev[category.id], values: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      )}

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newAttribute[category.id]?.required || false}
                          onChange={(e) => setNewAttribute(prev => ({
                            ...prev,
                            [category.id]: { ...prev[category.id], required: e.target.checked }
                          }))}
                          className="mr-2"
                        />
                        <span className="text-gray-700">Required attribute</span>
                      </label>

                      <button
                        onClick={() => handleAddAttribute(category.id)}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add Attribute
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No categories yet. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManagementPage;
