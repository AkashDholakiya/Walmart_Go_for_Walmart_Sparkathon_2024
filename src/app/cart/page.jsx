"use client"

import React, { useEffect, useState } from 'react';
import { ref, get, set } from 'firebase/database';
import { auth, rdb } from '../firebase'; 
import Navbar from '@/components/Navbar';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchCartItems = async () => {
        console.log("sadoiasdoi");
        const userId = auth.currentUser?.uid;
        const dbRef = ref(rdb, `userProducts/${userId}`);
        try {
          const snap = await get(dbRef);
          if (snap.exists()) {
            const data = snap.val();

            const itemsArray = Object.keys(data).map(key => ({
              id: key,
              ...data[key]
            }));

            setCartItems(itemsArray);
          }
        } catch (error) {
          console.error("Error fetching cart data:", error);
        }
    };


    setTimeout(() => {
      setLoading(true);
      fetchCartItems();

      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className='h-full'>
      <Navbar />
      <div className='h-[85%] p-4'>
        <h1 className='text-2xl font-bold mb-6'>Cart</h1>
        {cartItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-6 py-3 text-left">Product Name</th>
                  <th className="px-6 py-3 text-left">Quantity</th>
                  <th className="px-6 py-3 text-left">Price</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-100">
                    <td className="px-6 py-4 border-b border-gray-200">
                      <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-200">
                      <div className="text-sm text-gray-900">{item.quantity}</div>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-200">
                      <div className="text-sm text-gray-900">${item.price}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-600">{loading ? "Your cart is empty." : "Loading..."}</p>
        )}  
      </div>
    </div>
  );
};

export default Cart;
