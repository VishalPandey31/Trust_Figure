import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name:
        process.env.CLOUD_NAME,

    api_key:
        process.env.API_KEY,

    api_secret:
        process.env.API_SECRET,
});
export const uploadToCloudinary =
    async (
        buffer,
        folder,
        resourceType = "auto"
    ) => {

        return new Promise(
            (resolve, reject) => {

                cloudinary.uploader
                    .upload_stream(
                        {
                            folder:
                                `trustfigure/${folder}`,

                            resource_type:
                                resourceType,
                        },
                        (error, result) => {

                            if (error)
                                reject(error);

                            else
                                resolve(result);
                        }
                    )
                    .end(buffer);
            }
        );
    };