import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  itemCount: number;
  total: number;
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: Product }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
  itemCount: 0,
  total: 0,
};

const calculateItemCount = (items: CartItem[]): number => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    const price = item.product.discountPercentage
      ? item.product.price * (1 - item.product.discountPercentage / 100)
      : item.product.price;
    return total + price * item.quantity;
  }, 0);
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItemIndex = state.items.findIndex(
        (item) => item.product.id === action.payload.id
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
        };

        return {
          ...state,
          items: updatedItems,
          itemCount: calculateItemCount(updatedItems),
          total: calculateTotal(updatedItems),
        };
      } else {
        const updatedItems = [
          ...state.items,
          { product: action.payload, quantity: 1 },
        ];
        return {
          ...state,
          items: updatedItems,
          itemCount: calculateItemCount(updatedItems),
          total: calculateTotal(updatedItems),
        };
      }
    }
    case 'REMOVE_FROM_CART': {
      const updatedItems = state.items.filter(
        (item) => item.product.id !== action.payload
      );
      return {
        ...state,
        items: updatedItems,
        itemCount: calculateItemCount(updatedItems),
        total: calculateTotal(updatedItems),
      };
    }
    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map((item) =>
        item.product.id === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        ...state,
        items: updatedItems,
        itemCount: calculateItemCount(updatedItems),
        total: calculateTotal(updatedItems),
      };
    }
    case 'CLEAR_CART':
      return initialState;
    default:
      return state;
  }
};

interface CartContextType extends CartState {
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addToCart = (product: Product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const removeFromCart = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { productId, quantity },
    });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};