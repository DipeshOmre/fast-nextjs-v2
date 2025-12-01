'use client'
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/hooks/useAuthContext';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import { PreviewProduct } from '../../creative-ai-tools/_components/PreviewResult';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebaseServer';
import { Play } from 'lucide-react';
import Link from 'next/link';

const UsersAdsList = () => {
  const [adsList, setAdsList] = useState<PreviewProduct[]>([]);
  const { user } = useAuthContext(); 
    const [loading, setLoading] = useState(false)
    useEffect(() => {
      if (!user?.email) return;
      const q = query(collection(db, "user-ads"),
        where('userEmail', '==', user?.email))
      const unSub = onSnapshot(q, (querySnapshot) => {
        const matchedDocs: any = [];
        querySnapshot.forEach((doc) => {
          matchedDocs.push({ id: doc.id, ...doc.data() })
        })
        console.log(matchedDocs)
        setAdsList(matchedDocs);
      })
      return () => unSub();
    }, [user?.email]);
  return (
    <div>
      <h2 className='font-bold text-2xl mb-2 mt-5'>My Ads</h2>

      {
        adsList?.length==0 && 
        <div className='p-5 border-dashed border-2 rounded-2xl flex flex-col items-center justify-center gap-3 mt-6'>
          <Image src={'/signboard.png'} alt='empty' width={200} height={200} className='w-20'/>
          <h2>You dont have any ads created</h2>
          <Link href={user?'/creative-ai-tools/product-images':'/login'}>
          <Button>Create New Ads</Button>
          </Link>
          
        </div>
      }
      <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5'>
        {adsList?.map((ads, index) =>{
          return <div key={index}>
            <Image src={ads.finalProductImageUrl} alt={ads.finalProductImageUrl} height={400} width={'400'} className='w-full h-[250px] lg:h-[370px] object-cover rounded-xl' />
            <div className='flex items-center mt-2 justify-between'>
                <Link href={ads.finalProductImageUrl} target='_blank'>
              <Button className='' variant={'outline'}>View</Button>
              </Link>
              
              {ads?.videoUrl &&
              <Link href={ads.videoUrl} target='_blank'>
              <Button><Play/></Button>
              </Link>
              }
            </div>
          </div>
         }) }
      </div>
    </div>
  )
}

export default UsersAdsList
