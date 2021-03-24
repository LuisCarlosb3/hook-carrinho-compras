import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product } from '../types';

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
  const setItem = (newCart: Product[]) =>{
    setCart(newCart)
    localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
  }
  const addProduct = async (productId: number) => {
    try {
      const response = await api.get(`/stock/${productId}`)
      const productStock = response.data
      if(productStock.amount === 0){
        toast.error('Quantidade solicitada fora de estoque')
        return
      }
      const productToInsert = cart.find(product=> product.id === productId)
      if(productToInsert){
        const newAmout = productToInsert.amount + 1
        if(newAmout>productStock.amount){
          toast.error('Quantidade solicitada fora de estoque')
          return
        }
        const productList = cart.map(product=>{
          if(product.id=== productId){
            const amount = product.amount + 1
            return {...product, amount}
          }
          return product
        })
        setItem(productList)
      }else{
        const { data } = await api.get(`/products/${productId}`)       
        const newItem = {...data, amount: 1}
        const newProductList = [...cart, newItem]
        setItem(newProductList)
      }
    } catch (error){
      toast.error('Erro na adição do produto')
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const productIndex = cart.findIndex(product=> productId === product.id)
      if(productIndex === -1){
        throw new Error()
      }else{
        const updatedList = cart.filter(product=>productId !== product.id)
        setItem(updatedList)
      }
    } catch (error){
      toast.error('Erro na remoção do produto')
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if(amount<=0){
        return
      }
      const productStockPayload = await api.get(`/stock/${productId}`)
      const productStock = productStockPayload.data
      if(productStock.amount < amount){
        toast.error('Quantidade solicitada fora de estoque')
        return
      }
      const updatedList = cart.map(product=> {
        if(product.id === productId){
          return {...product, amount}
        }
        return product
      })
      setItem(updatedList)
    } catch (error){
      toast.error('Erro na alteração de quantidade do produto')
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
