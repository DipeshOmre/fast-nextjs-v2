import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React from 'react'

const AiTools=[
    {
        name:'AI Products Image',
        desc:'Generate stunning images with AI',
        banner:'/product-image.png',
        path:'/',
    },
    {
        name:'AI Products Video',
        desc:'Create engaging videos with AI',
        banner:'/product-video.png',
        path:'/',
    },
    {
        name:'AI Products with Avatar',
        desc:'Bring your products to life with AI avatars',
        banner:'/product-avatar.png',
        path:'/',
    }
]
function AiToolList ()  {
  return (
    <div>
      <h2 className='font-bold text-2xl mb-2'>Creative AI Tool</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
        {AiTools.map((tool,index)=>{
            return(
                <div key={index} className='flex items-center justify-between p-7 bg-zinc-800 rounded-2xl'>
                    <div>
                      <h2 className='font-bold text-2xl'>{tool.name}</h2>
                      <p className='opacity-60 mt-2'>{tool.desc}</p>
                      <Button className='mt-4'> Create Now</Button>
                    </div>
                    
                    <Image src={tool.banner} alt={tool.name} width={300} height={300} className='w-[200px]'/>
                </div>
            )
        })}
      </div>
    </div>
  )
}

export default AiToolList
