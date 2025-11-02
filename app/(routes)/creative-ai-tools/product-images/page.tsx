"use client"
import React, { useState } from 'react'
import PreviewResult from '../_components/PreviewResult'
import Forminput from '../_components/Forminput'
import axios from 'axios'
import { useAuthContext } from '@/hooks/useAuthContext'
type FormData = {
  file?: File | undefined,
  description: string,
  size: string,
  imageURL?: string
}
const ProductImages = ({title}:any) => {
  const [formData, setFormData] = useState<FormData>()
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();
  const onHandleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => (
      {
        ...prev,
        [field]: value
      }

    ))
  }
  const onGenerate = async () => {
    console.log("ongenerate is called")
    if (!formData?.file && !formData?.imageURL) {
      alert("please upload product image");
      return;
    }
    if (!formData?.description || !formData?.size) {
      alert('Enter all fields');
      return;
    }
    setLoading(true);
    const formData_ = new FormData();
    // @ts-ignore
    formData_.append('file', formData?.file);
    formData_.append('description', formData?.description ?? '');
    formData_?.append('size', formData?.size ?? '1028x1028');
    formData_?.append('userEmail', user?.email ?? '');
    console.log(user?.email)



    // Make api call
    const result = await axios.post('/api/generate-product-image', formData_)
    console.log("result data :", result.data);
    setLoading(false);
  }
  return (
    <div>
      <h1 className='font-bold text-2xl mb-3'>{title?title:'AI Product Image Generator'}</h1>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
        <div>
          <Forminput onHandleInputChange={(field: string, value: string) => onHandleInputChange(field, value)}
            onGenerate={onGenerate}
            loading={loading} />
        </div>
        <div className='md:col-span-2'>
          <PreviewResult />
        </div>
      </div>
    </div>
  )
}

export default ProductImages 