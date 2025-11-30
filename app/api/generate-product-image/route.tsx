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
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebaseServer';

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
    const description = formData.get('description');
    const size = formData.get('size');
    const userEmail = formData.get('userEmail');
    const userRef = collection(db, 'users');
    const q = query(userRef, where('userEmail', '==', userEmail));
    const querySnapshot = await getDocs(q);
    const userDoc = querySnapshot.docs[0];
    const userInfo = userDoc?.data();
    console.log(userEmail);
    console.log(size);
    console.log(description);
    const docId = Date.now().toString();
    await setDoc(
      doc(db, "user-ads", docId),
      {
        userEmail: userEmail,
        status: 'pending',
        description: description,
        size: size,
      }
    );
    if (!file) {
      return NextResponse.json({ error: 'No file found in form data.' }, { status: 400 });
    }


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

    const productImageUrl = imageKitRef.url;
    // console.log('Image uploaded to ImageKit:', imageUrl);

    // --- Step 3: Fetch Image and Send to Gemini ---
    let imagePart: Part;
    try {
      imagePart = await urlToImagePart(productImageUrl);
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

    // Try multiple payload variants (for openai/gpt-5-image-mini)
    const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
    const OPENROUTER_MODEL = 'openai/gpt-5-image-mini';
    const promptText = parsedPrompts?.textToImage || USER_PROMPT || '';


    // ,// Send messages with image_url + text
    const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: promptText
              },
              {
                type: 'image_url',
                image_url: {
                  url: productImageUrl
                }
              }
            ],
          },
        ],
        modalities: ['image', 'text'],
        max_tokens: 1000,
      }),
    });
    const orJs = await orRes.json();
    // console.log('OpenRouter Response:', JSON.stringify(orJs, null, 2));
    // The generated image will be in the assistant message
    if (orJs.choices) {
      // console.log('Generated message from OpenRouter:', message);
      let finalProductImageUrl = '';
      let returnedText = '';

      // extract base64 image
      const message = orJs?.choices?.[0]?.message;
      if (message?.images?.length > 0) {
        const imgData = message.images[0].image_url.url; // base64 with prefix
        console.log("Raw Base64 from OpenRouter:", imgData.substring(0, 50) + "...");

        // remove prefix 'data:image/png;base64,'
        const base64Image = imgData.replace(/^data:image\/\w+;base64,/, "");

        // upload to ImageKit
        try {
          const uploaded = await imagekit.upload({
            file: base64Image,
            fileName: `generated_${Date.now()}.png`,
            isPublished: true,
          });

          finalProductImageUrl = uploaded.url;
          console.log("Uploaded Final Image URL:", finalProductImageUrl);
          await updateDoc(doc(db, "user-ads", docId), {
            finalProductImageUrl,
            productImageUrl,
            status: 'completed',
            userInfo: userInfo?.credits - 5,
            imageToVideoPrompt:parsedPrompts?.imageToVideo
          });

          return NextResponse.json(finalProductImageUrl);

        } catch (e: any) {
          console.error("ImageKit Upload Failed:", e.message);
        }
      }

    }



    // --- Extract text + images from different possible shapes ---
    // --- PARSE OpenRouter response and upload a single image to ImageKit ---
    // orData is the parsed OpenRouter response (you already have it)


    // Upload to ImageKit (file should be raw base64 WITHOUT data: prefix)

    // let finalProductImageUrl = '';
    // let returnedText = '';
    // // 5) Final response
    // const openrouterResult = {
    //   text: returnedText,
    //   imageUrl: finalProductImageUrl,
    //   raw: orJs,
    // };

    // //Save to the firestore database
    // console.log({
    //   userEmail,
    //   finalProductImageUrl,
    //   productImageUrl,
    //   description,
    //   size
    // });

    // //update Doc
    // await updateDoc(doc(db, "user-ads", docId), {
    //   finalProductImageUrl: finalProductImageUrl,
    //   productImageUrl: productImageUrl,
    //   status: 'completed',
    //   userInfo: userInfo?.credits - 5
    // })

    // console.log('OpenRouter parsed result:', openrouterResult);
    console.log('No valid image generated from OpenRouter api.');
    return NextResponse.json({ message: 'Api problem' });




  } catch (error: any) {
    // General error handler
    console.error('Error in /api/generate-product-image:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.', details: error.message },
      { status: 500 }
    );
  }
}

