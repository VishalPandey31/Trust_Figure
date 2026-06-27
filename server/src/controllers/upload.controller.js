import Message from "../models/message.js";

import {
    uploadToCloudinary,
}
    from "../utils/cloudinary.js";

export const uploadFile =
    async (req, res) => {

        try {

            if (!req.file) {

                return res.status(400)
                    .json({
                        message:
                            "File required",
                    });
            }

            const result =
                await uploadToCloudinary(
                    req.file.buffer,
                    "vault"
                );

            // const message =
            //     await Message.create({

            //         sender:
            //             req.user._id,

            //         mediaUrl:
            //             result.secure_url,

            //         messageType:
            //             "file",
            //     });

            return res.status(200).json({
                mediaUrl: result.secure_url,
                publicId: result.public_id,
            });

        } catch (error) {

            res.status(500).json({
                message:
                    error.message,
            });
        }
    };