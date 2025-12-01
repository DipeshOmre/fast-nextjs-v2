"use client"
import { Textarea } from '@/components/ui/textarea';
import { Divide, ImagePlus, ImagePlusIcon, Loader2Icon, Monitor, Smartphone, Sparkles, Square } from 'lucide-react'
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button';
const sampleProducts = [
    '/headphone.png',
    '/juice-can.png',
    '/perfume.png',
    '/burger.png',
    '/ice-creame.png',
]


const AvatarList=[
    {
        name:'Avatar 1',
        imageUrl:'https://ik.imagekit.io/67ziqcwhn/Avatar/av5.webp?updatedAt=1762103261069'
    },
    {
        name:'Avatar 2',
        imageUrl:'https://ik.imagekit.io/67ziqcwhn/Avatar/av1.webp?updatedAt=1762102842535'
    },
    {
        name:'Avatar 3',
        imageUrl:'https://ik.imagekit.io/67ziqcwhn/Avatar/av3.webp?updatedAt=1762102842379'
    },
    {
        name:'Avatar 4',
        imageUrl:'https://ik.imagekit.io/67ziqcwhn/Avatar/av4.webp?updatedAt=1762102840039'
    },
    {
        name:'Avatar 5',
        imageUrl:'https://ik.imagekit.io/67ziqcwhn/Avatar/av2.webp?updatedAt=1762102836926'
    }
]
type Props = {
    onHandleInputChange: any,
    onGenerate:any,
    loading:boolean,
    enableAvatar:boolean
}

const Forminput = ({ onHandleInputChange,onGenerate,loading,enableAvatar}: Props) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedAvatar, setSelectedAvatar] = useState<string>()
    const onFileSelect = (files: FileList | null) => {
        if (!files || files?.length == 0) return;
        const file = files[0];
        if (file.size > 5 * 1024 * 1024) {
            alert("File size exceeds 5MB");
            return;
        }
        onHandleInputChange('file', file)
        setPreview(URL.createObjectURL(file));
    }
    
    
    return (
        <div className='p-5 rounded-2xl border'>
            <h2 className='font-semibold'>
                1. Upload Product Image
            </h2>
            <div>
                <label htmlFor='imageUpload' className='mt-2 border-dashed border-2 rounded-2xl flex flex-col p-4 items-center justify-center min-h-[200px] cursor-pointer'>
                    {!preview ? <div className='flex flex-col items-center gap-3'>
                        <ImagePlus className='h-8 w-8 opacity-40' />
                        <h2 className='text-xl'>
                            Click here to upload image
                        </h2>
                        <p className='opacity-45'>Upload image upto 5MB</p>
                    </div> :
                        <Image src={preview} alt='preivew' width={300} height={300} className='w-full h-full max-h-[200px] object-contain rounded-lg' />

                    }
                </label>
                <input type="file" id='imageUpload' className='hidden' onChange={(e) => onFileSelect(e.target.files)} />
                   
                {!enableAvatar &&  <div>

                    <h2 className='opacity-40 text-center mt-3'>Select Sample products to try</h2>
                    <div className='flex gap-5 items-center flex-wrap'>
                        {sampleProducts.map((product, index) => (
                            <Image src={product} alt='product' width={60} height={60} key={index} className='w-[60px] h-[60px] rounded-lg cursor-pointer hover:scale-105 transition-all' onClick={() => { setPreview(product); onHandleInputChange('imageUrl', product) }} />
                        ))}
                    </div>
                </div>}

            </div>
            {enableAvatar &&
            <div className='mt-8'>
                <h2 className='font-semibold'>  
                    Select Avatar
                </h2>
                <div className='grid grid-cols-4 gap-3 mt-2'>
                    {AvatarList.map((avatar,index)=>{
                        return <Image key={index} src={avatar.imageUrl} alt={avatar.name} width={200} height={200} className={`rounded-lg h-[100px] w-[80px] cursor-pointer object-cover ${avatar.name==selectedAvatar && 'border border-primary'}`}onClick={()=>{setSelectedAvatar(avatar.name);onHandleInputChange('avatar',avatar.imageUrl)}}/>
                        
                    })}
                </div>
                
            </div>}
            <div className='mt-8'>
                <h2 className='font-semibold'>
                    2. Enter Product description
                </h2>
                <Textarea placeholder='Tell me more about your product and how you want to display' className='min-h-[150px] mt-2' onChange={(event) => { onHandleInputChange('description', event.target.value) }} />
            </div>
            <div className='mt-8'>
                <h2 className='font-semibold'>
                    3. Select image Size
                </h2>
                <Select onValueChange={(value) => onHandleInputChange('size', value)}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Resolution" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1024X1024">
                            <div className='flex gap-2 items-center'>
                                <Square className='h-4 w-4' />
                                <span>1:1</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="1536X1024">
                            <div className='flex gap-2 items-center'>
                                <Monitor className='h-4 w-4' />
                                <span>16:9</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="1024X1536">
                            <div className='flex gap-2 items-center'>
                                <Smartphone className='h-4 w-4' />
                                <span>9:16</span>
                            </div>
                        </SelectItem>

                    </SelectContent>
                </Select>
            </div>

            <Button disabled={loading} className='mt-5 w-full' onClick={()=>onGenerate()}> {loading?<Loader2Icon className='animate-spin'/>:<Sparkles />}Generate</Button>
            <h2 className='mt-1 text-sm opacity-35 text-center'>5 Credit to Generate</h2>
        </div>
    )
}

export default Forminput