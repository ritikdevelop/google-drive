"use server";

import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "../appwrite/config";
import { ID, Query } from "node-appwrite";
import { parseStringify } from "../utils";
import { cookies } from "next/headers";

//? Create Account Flow
// The create account flow is a critical part of the user experience. It should be easy to follow,

// 1. Users enters full name and email
// 2. Check if the user already exist or not
// 3. If not, create a new user
// 4. If yes, show the login page
// 5. Send OTP to users email
// 6. Return the users accountId that will be used to complete the login
// Verify OTP and authenticate to login

//! Get user EmailId from this function 
const getUserByEmail = async (email:string) => {
    const {databases} = await createAdminClient();

    const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        [Query.equal("email", [email])]
    );

    return result.total > 0 ? result.documents[0] : null;
};

const handleError = (error:unknown, message:string) => {
    console.log(error, message);
    throw error;
};

//! Send OTP from the user mobile from this function
export const sendEmailOTP = async ({ email }:{email: string}) => {
    const { account } = await createAdminClient();

    try {
        const session = await account.createEmailToken(ID.unique(), email);

        return session.userId;
    } catch (error) {
        handleError(error, "Failed to send email OTP");
    }
}


// !Create User account from this function
export const createAccount = async ({
    fullName,
    email,
}:{
    fullName: string,
    email: string,
}) => {
    const existingUser = await getUserByEmail(email);

    const accountId = await sendEmailOTP({email});
    if(!accountId) {
        throw new Error("Failed to send an OTP");
    }

    if(!existingUser) {
        const {databases} = await createAdminClient();

        await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            ID.unique(),
            {
                fullName,
                email,
                avatar: "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png",
                accountId,
            },
        );
    }

    return parseStringify({accountId});
};

export const verifySecret = async ({accountId, password}: {accountId: string, password: string}) => {
    try {
        const { account } = await createAdminClient();

        const session = await account.createSession(accountId, password);

        (await cookies()).set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });
        return parseStringify({ sessionId: session.$id });
    } catch (error) {
        handleError(error, "Failed to verify OTP");
    }

};