// import { NextRequest, NextResponse } from "next/server";
// import { eq } from "drizzle-orm";
// import { db } from "@/configs/db";
// import { usersTable } from "@/configs/schema";
// import { verifyFirebaseToken } from "@/lib/firebaseAdmin";
// import { extractTokenFromRequest } from "@/lib/firebaseAuth";

// export async function POST(req: NextRequest) {
//     try {
//         // Extract token from request
//         const token = extractTokenFromRequest(req);
//         if (!token) {
//             return NextResponse.json(
//                 { error: "No authentication token provided" },
//                 { status: 401 }
//             );
//         }

//         // Verify Firebase token
//         const decodedToken = await verifyFirebaseToken(token);
//         if (!decodedToken || !decodedToken.email) {
//             return NextResponse.json(
//                 { error: "Unauthorized or missing email address" },
//                 { status: 401 }
//             );
//         }

//         const email = decodedToken.email;

//         // Check if user already exists
//         const existingUsers = await db
//             .select()
//             .from(usersTable)
//             .where(eq(usersTable.email, email));

//         if (existingUsers.length > 0) {
//             return NextResponse.json(existingUsers[0]);
//         }

//         // Insert new user
//         const insertedUsers = await db
//             .insert(usersTable)
//             .values({
//                 name: decodedToken.name ?? "",
//                 email: email,
//             })
//             .returning();

//         return NextResponse.json(insertedUsers[0]);
//     } catch (e: any) {
//         return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
//     }
// }
