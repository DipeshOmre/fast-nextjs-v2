import { db } from "@/lib/firebaseServer";
import { replicate } from "@/lib/replicate";
import { imagekit } from "@/utils/imagekit";
import { doc, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { imageUrl, imageToVideoPrompt, uid, docId } = await req.json();
    console.log('Starting video generation with:', { imageUrl, imageToVideoPrompt });
    const input = {
        image: imageUrl,
        prompt: imageToVideoPrompt,
        duration:4,
    };

    await updateDoc(doc(db, "user-ads", docId), {
        imageToVideoStatus: 'pending',
    });
   const output = await replicate.run("minimax/video-01", { input }); 
   // @ts-ignore 
   console.log("Video generation output:", output.url());
   // @ts-ignore 
   const resp=await fetch(output.url());
   const videobuffer=Buffer.from(await resp.arrayBuffer());
   const uploadResult=await imagekit.upload({
         file:videobuffer,
        fileName:`product-video-${Date.now()}.mp4`,
        isPublished:true,
   })
   await updateDoc(doc(db, "user-ads", docId), { imageToVideoStatus: 'completed',
    videoUrl:uploadResult.url
    }); 
   // @ts-ignore 
   return NextResponse.json(uploadResult.url);
}