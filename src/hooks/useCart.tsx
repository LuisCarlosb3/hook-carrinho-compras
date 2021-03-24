import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')
    const cartValue = storagedCart ? JSON.parse(storagedCart) : []
    return cartValue
  });
  const addProduct = async (productId: number) => {
    try {
      const productIndex = cart.findIndex(product=> product.id === productId)
      if(productIndex >= 0){
        const productList = cart.map(product=>{
          if(product.id=== productId){
            const amount = product.amount + 1
            return {...product, amount}
          }
          return product
        })
        setCart(productList)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(productList))
      }else{
        const { data } = await api.get('/products')
        const productInfo = data.find((product: Product)=>product.id === productId)        
        const newItem = {...productInfo, amount: 1}
        const newProductList = [...cart, newItem]
        setCart(newProductList)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newProductList))
      }
    } catch (error){
      console.log(error)
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const updatedList = cart.map(product=> {
        if(product.id === productId){
          return {...product, amount}
        }
        return product
      })
      setCart(updatedList)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedList))
    } catch (error){
      console.log(error)
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
