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
    const requestBody = {
      model: OPENROUTER_MODEL,
      input: `${promptText}\n\nImage: ${productImageUrl}`,
      // optional: temperature, max_tokens, response_format, etc.
    };

    console.log('Calling OpenRouter with body preview:', JSON.stringify(requestBody).slice(0, 1000));
    const orRes = await fetch('https://openrouter.ai/api/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const orText = await orRes.text();
    // try parse JSON (some responses may be text)
    let orData: any;
    try {
      orData = JSON.parse(orText);
    } catch (e) {
      orData = orText;
    }
    console.log('OpenRouter raw response:', orData);
    // continue parsing orData to extract text + image...
    if (!orRes.ok || (orData && orData.success === false) || orData?.error) {
      console.error('OpenRouter returned error:', orData);
      return NextResponse.json({ parsedPrompts, openrouterError: orData }, { status: 500 });
    }

    // --- Extract text + images from different possible shapes ---
    // --- PARSE OpenRouter response and upload a single image to ImageKit ---
    // orData is the parsed OpenRouter response (you already have it)

    let returnedText: string | null = null;
    let finalProductImageUrl: string | null = null;

    // 1) Extract text from reasoning entry if present
    if (Array.isArray(orData.output)) {
      const reasoning = orData.output.find((o: any) => o?.type === 'reasoning');
      if (reasoning) {
        if (typeof reasoning.encrypted_content === 'string' && reasoning.encrypted_content.trim()) {
          returnedText = reasoning.encrypted_content;
        } else if (Array.isArray(reasoning.summary) && reasoning.summary.length > 0) {
          returnedText = String(reasoning.summary[0]);
        }
      }
    }

    // 2) Extract image result from image_generation_call entry
    let imageResult: any = null;
    if (Array.isArray(orData.output)) {
      const imgCall = orData.output.find((o: any) => o?.type === 'image_generation_call' && o?.status === 'completed');
      if (imgCall) imageResult = imgCall.result;
    }

    if (!imageResult) {
      console.error('No image_generation_call.result found in OpenRouter response.');
      return NextResponse.json({ parsedPrompts, openrouterError: 'No image_generation_call result' }, { status: 500 });
    }

    // 3) imageResult may be a data URI string or JSON. Handle both:
    // If it's a JSON string, parse it. If it's a data URI, extract base64.
    let imageBase64: string | null = null;
    let imageUrlFromProvider: string | null = null;

    if (typeof imageResult === 'string') {
      // common case in your sample: data:image/png;base64,AAA...
      if (imageResult.startsWith('data:image/')) {
        const commaIndex = imageResult.indexOf(',');
        if (commaIndex >= 0) {
          imageBase64 = imageResult.slice(commaIndex + 1);
        }
      } else {
        // try parse JSON string
        try {
          const parsed = JSON.parse(imageResult);
          // look for parsed.images[0].b64_json or .url or parsed.data etc.
          if (Array.isArray(parsed.images) && parsed.images[0]) {
            if (parsed.images[0].b64_json) imageBase64 = parsed.images[0].b64_json.replace(/^data:image\/\w+;base64,/, '');
            else if (parsed.images[0].url) imageUrlFromProvider = parsed.images[0].url;
          }
          if (!imageBase64 && Array.isArray(parsed.data) && parsed.data[0]) {
            if (parsed.data[0].b64_json) imageBase64 = parsed.data[0].b64_json.replace(/^data:image\/\w+;base64,/, '');
            else if (parsed.data[0].url) imageUrlFromProvider = parsed.data[0].url;
          }
          if (!imageBase64 && !imageUrlFromProvider && parsed?.b64_json) {
            imageBase64 = parsed.b64_json.replace(/^data:image\/\w+;base64,/, '');
          }
          if (!imageBase64 && !imageUrlFromProvider && parsed?.image_url) {
            imageUrlFromProvider = parsed.image_url;
          }
        } catch (e) {
          // not JSON — and not data URI
          console.warn('imageResult is string but not data URI nor JSON.');
        }
      }
    } else if (typeof imageResult === 'object' && imageResult !== null) {
      // object case
      if (Array.isArray(imageResult.images) && imageResult.images[0]) {
        const first = imageResult.images[0];
        if (first?.b64_json) imageBase64 = String(first.b64_json).replace(/^data:image\/\w+;base64,/, '');
        else if (first?.url) imageUrlFromProvider = first.url;
      }
      if (!imageBase64 && Array.isArray(imageResult.data) && imageResult.data[0]) {
        const first = imageResult.data[0];
        if (first?.b64_json) imageBase64 = String(first.b64_json).replace(/^data:image\/\w+;base64,/, '');
        else if (first?.url) imageUrlFromProvider = first.url;
      }
      if (!imageBase64 && !imageUrlFromProvider && imageResult?.b64_json) {
        imageBase64 = String(imageResult.b64_json).replace(/^data:image\/\w+;base64,/, '');
      }
      if (!imageBase64 && !imageUrlFromProvider && imageResult?.image_url) {
        imageUrlFromProvider = imageResult.image_url;
      }
    }

    // 4) Validate and upload (prefer provider URL, else upload base64)
    if (imageUrlFromProvider) {
      finalProductImageUrl = imageUrlFromProvider;
      console.log('Using provider image URL from OpenRouter:', finalProductImageUrl);
    } else if (imageBase64) {
      // safety: ensure non-empty
      const cleaned = String(imageBase64).trim();
      if (!cleaned) {
        console.error('Extracted base64 is empty.');
        return NextResponse.json({ parsedPrompts, openrouterError: 'Empty base64 image returned' }, { status: 500 });
      }

      // Upload to ImageKit (file should be raw base64 WITHOUT data: prefix)
      try {
        const uploadResp = await imagekit.upload({
          file: `data:image/png;base64,${cleaned}`,
          fileName: `openrouter_out_${Date.now()}.png`,
          isPublished: true,
        });
        finalProductImageUrl = uploadResp?.url;
        console.log('Uploaded generated image to ImageKit:', finalProductImageUrl);
      } catch (uErr: any) {
        console.error('ImageKit upload failed:', uErr);
        return NextResponse.json({ parsedPrompts, openrouterError: 'ImageKit upload failed' }, { status: 500 });
      }
    } else {
      console.error('No image URL or base64 could be extracted from imageResult.');
      return NextResponse.json({ parsedPrompts, openrouterError: 'Could not extract image' }, { status: 500 });
    }

    // 5) Final response
    const openrouterResult = {
      text: returnedText,
      imageUrl: finalProductImageUrl,
      raw: orData,
    };

    //Save to the firestore database
    console.log({
      userEmail,
      finalProductImageUrl,
      productImageUrl,
      description,
      size
    });

    //update Doc
    await updateDoc(doc(db, "user-ads", docId), {
      finalProductImageUrl: finalProductImageUrl,
      productImageUrl: productImageUrl,
      status: 'completed',
      userInfo: userInfo?.credits - 5
    })

    console.log('OpenRouter parsed result:', openrouterResult);
    return NextResponse.json(finalProductImageUrl);




  } catch (error: any) {
    // General error handler
    console.error('Error in /api/generate-product-image:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.', details: error.message },
      { status: 500 }
    );
  }
}

