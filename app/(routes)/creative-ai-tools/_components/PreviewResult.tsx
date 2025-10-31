import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/hooks/useAuthContext'
import { db } from '@/lib/firebaseServer';
import { collection, onSnapshot, query, QuerySnapshot, where } from 'firebase/firestore';
import { Download, Loader2Icon, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
type PreviewProduct = {
  id: string,
  finalProductImageUrl: string,
  productImageUrl: string,
  description: string,
  size: string,
  status: string
}
const PreviewResult = () => {
  const { user } = useAuthContext();
  const [productList, setProductList] = useState<PreviewProduct[]>([])
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
      setProductList(matchedDocs);
    })
    return () => unSub();
  }, [user?.email]);
  const DownloadImage=async (imageURL:string)=>{
    const result=await fetch(imageURL);
    const blob=await result.blob();
    const blobUrl=window.URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=blobUrl;
    a.setAttribute('download','Dipp');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  }
  return (
    <div className='p-5 rounded-2xl border'>
      <h2 className='font-bold text-2xl'>Generated Result</h2>
      <div className='grid grid-cols-2 mt-4 md:grid-cols-2 lg:grid-cols-3 gap-5'>
        {productList?.map((product, index) => {
          return <div key={index}>
            {product?.status == 'completed' ?
              <div>

                <Image src={product.finalProductImageUrl} alt={product.id} height={500} width={500} className='w-full h-[250px] object-cover rounded-lg' />
                <div className='flex justify-between items-center mt-2'>
                  <div className='flex items-center gap-2'>

                    <Button variant={'ghost'} onClick={()=>DownloadImage(product.finalProductImageUrl)}><Download /></Button>
                    <Link href={product.finalProductImageUrl} target='_blank'>
                      <Button variant={'ghost'}>View</Button>
                    </Link>
                  </div>
                  <Button><Sparkles />Animate</Button>
                </div>
              </div>
              :
              <div className='flex flex-col items-center justify-center border rounded-xl h-full max-h-[250px] bg-zinc-800'>
                <Loader2Icon className='animate-spin' />
                <h2>Generating...</h2>
              </div>
            }
          </div>
        })}
      </div>
    </div>
  )
}

export default PreviewResult