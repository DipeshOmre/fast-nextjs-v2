import { imagekit } from "@/utils/imagekit";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const description = formData.get('description');
    const size = formData?.get('size');

    // upload product image
    const arrayBuffer = await file.arrayBuffer();
    const base64File = Buffer.from(arrayBuffer).toString('base64');


    const imageKitRef = await imagekit.upload({
        file: base64File,
        fileName: Date.now() + ".png",
            isPublished:true
    });
    console.log(imageKitRef.url);
    return NextResponse.json(imageKitRef.url);
}