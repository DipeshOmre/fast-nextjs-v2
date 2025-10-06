import Image from 'next/image'
import React from 'react'

const AiTools=[
    {
        name:'AI Products Image',
        desc:'Generate stunning images with AI',
        banner:'/product-image.png',
    },
    {
        name:'AI Products Video',
        desc:'Create engaging videos with AI',
        banner:'/product-video.png',
    },
    {
        name:'AI Products with Avatar',
        desc:'Bring your products to life with AI avatars',
        banner:'/product-avatar.png',
    }
]
function AiToolList ()  {
  return (
    <div>
      <h2 className='font-bold text-2xl mb-2'>Creative AI Tool</h2>
      <div>
        {AiTools.map((tool,index)=>{
            return(
                <div key={index}>
                    <div>

                    </div>
                    
                    <Image src={tool.banner} alt={tool.name} width={300} height={300} />
                </div>
            )
        })}
      </div>
    </div>
  )
}

export default AiToolList
