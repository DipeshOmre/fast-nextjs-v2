// import { imagekit } from "@/utils/imagekit";
// import { NextRequest, NextResponse } from "next/server";
// const PROMPT="Create a vibrant product showcase image featuring a uploaded image in the center, surrounded by dynamic splashes of liquid or relevant material that complement the product.Use a clean, colorful background to make the product stand out.Include subtle elements related to the product's flavor,ingredients, or theme floating around to add context and visual interest. Ensure the produxt is sharp and in focus, with motion and energy conveyed through the splash effect, Also give me image to video prompt for same in JSON format: {textToImage:'',imageToVideo:''}"
// export async function POST(req: NextRequest) {
//     const formData = await req.formData();
//     const file = formData.get('file') as File;
//     const description = formData.get('description');
//     const size = formData?.get('size');

//     // upload product image
//     const arrayBuffer = await file.arrayBuffer();
//     const base64File = Buffer.from(arrayBuffer).toString('base64');


//     const imageKitRef = await imagekit.upload({
//         file: base64File,
//         fileName: Date.now() + ".png",
//             isPublished:true
//     });
    // console.log(imageKitRef.url);
//     return NextResponse.json(imageKitRef.url);
// }


import { imagekit } from '@/utils/imagekit';
import { NextRequest, NextResponse } from 'next/server';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  Part,
} from '@google/generative-ai';

// --- Gemini API Configuration ---

// Get the API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  // This will throw an error when the server starts if the key is missing.
  throw new Error('GEMINI_API_KEY is not defined in environment variables.');
}

// Initialize the GoogleGenerativeAI client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// The specific prompt you provided
const USER_PROMPT =
  "Create a vibrant product showcase image featuring a uploaded image in the center, surrounded by dynamic splashes of liquid or relevant material that complement the product.Use a clean, colorful background to make the product stand out.Include subtle elements related to the product's flavor,ingredients, or theme floating around to add context and visual interest. Ensure the produxt is sharp and in focus, with motion and energy conveyed through the splash effect, Also give me image to video prompt for same in JSON format: {textToImage:'',imageToVideo:''}";

/**
 * Defines the JSON schema that we expect Gemini to return.
 * This helps ensure we get a valid JSON object.
 */
const responseSchema = {
  type: 'OBJECT',
  properties: {
    textToImage: { type: 'STRING' },
    imageToVideo: { type: 'STRING' },
  },
  required: ['textToImage', 'imageToVideo'],
};

// --- Helper Function ---

/**
 * Fetches an image from a URL and converts it into a GoogleGenerativeAI.Part object.
 * Gemini cannot read a URL directly; it needs the image data.
 * @param {string} url - The public URL of the image (e.g., from ImageKit.io).
 * @returns {Promise<Part>} - A promise that resolves to an image Part.
 */
async function urlToImagePart(url: string): Promise<Part> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from URL: ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.startsWith('image/')) {
    throw new Error('Invalid content type. Fetched resource is not an image.');
  }

  const arrayBuffer = await response.arrayBuffer();
  const base64Data = Buffer.from(arrayBuffer).toString('base64');

  return {
    inlineData: {
      data: base64Data,
      mimeType: contentType,
    },
  };
}

// --- Main POST Handler ---

export async function POST(req: NextRequest) {
  try {
    // --- Step 1: Get File from Request ---
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file found in form data.' }, { status: 400 });
    }
    // You can still get these if needed, though they aren't used in the prompt
    // const description = formData.get('description');
    // const size = formData?.get('size');

    // --- Step 2: Upload to ImageKit.io ---
    const arrayBuffer = await file.arrayBuffer();
    const base64File = Buffer.from(arrayBuffer).toString('base64');

    let imageKitRef;
    try {
      imageKitRef = await imagekit.upload({
        file: base64File,
        fileName: Date.now() + '.png',
        isPublished: true,
      });
    } catch (uploadError: any) {
      console.error('ImageKit upload failed:', uploadError.message);
      return NextResponse.json(
        { error: 'Failed to upload image.', details: uploadError.message },
        { status: 500 }
      );
    }

    const imageUrl = imageKitRef.url;
    // console.log('Image uploaded to ImageKit:', imageUrl);

    // --- Step 3: Fetch Image and Send to Gemini ---
    let imagePart: Part;
    try {
      imagePart = await urlToImagePart(imageUrl);
    } catch (fetchError: any) {
      console.error('Error fetching image from ImageKit URL:', fetchError.message);
      return NextResponse.json(
        { error: 'Failed to fetch image from upload URL.', details: fetchError.message },
        { status: 500 }
      );
    }

    // Configure the model to use JSON output
    const model = genAI.getGenerativeModel({
      model: 'models/gemini-robotics-er-1.5-preview',
       // Using 1.5-flash for speed and vision
      generationConfig: {
        responseMimeType: 'application/json',
        // @ts-ignore
        responseSchema: responseSchema,
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
    });

    // --- Step 4: Generate Content from Gemini ---
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            imagePart, // The image fetched from ImageKit
            { text: USER_PROMPT }, // Your prompt
          ],
        },
      ],
    });

    // --- Step 5: Process and Return Gemini's Response ---
    const response = result.response;
    const responseText = response.text();

    // Parse the JSON string from Gemini's text response
    const parsedPrompts = JSON.parse(responseText);

   

    // Send the final JSON object to the client
    // console.log(parsedPrompts);
    return NextResponse.json(parsedPrompts, { status: 200 });

  } catch (error: any) {
    // General error handler
    console.error('Error in /api/generate-product-image:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.', details: error.message },
      { status: 500 }
    );
  }
}

