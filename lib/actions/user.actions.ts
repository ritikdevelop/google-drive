"use server";

import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "../appwrite/config";
import { ID, Query } from "node-appwrite";

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


//! Send OTP from the user mobile from this function
const sendEmailOTP = async ({ email }:{email: string}) => {
    const { account } = await createAdminClient();

    try {
        const session = await account.createEmailToken(ID.unique(), email);

        return session.userId;
    } catch (error) {
        
    }
}


// !Create User account from this function
const createAccount = async ({
    fullName,
    email,
}:{
    fullName: string,
    email: string,
}) => {
    const existingUser = await getUserByEmail(email);

    const accountId = await sendEmailOTP(email);
};