// node-appwrite

import { Client, Account, Databases } from "node-appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { cookies } from "next/headers";
import { get } from "http";
export const createSessionClient = async () =>{
    const client = new Client()
    .setEndpoint(appwriteConfig.endpointUrl)
    .setProject(appwriteConfig.projectId)


    const session = (await cookies()).get('appwrite-session');
    if(!session || !session.value){
        throw new Error('No session found');
    }
    client.setSession(session.value);

    return{
        get account(){
            return new Account(client);
        }
        get databases(){
            return new Databases(client);
        }
    }
}


export const createAdminClient = async () =>{

}