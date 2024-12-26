/************
.web.js file
************

Backend '.web.js' files contain functions that run on the server side and can be called from page code.

Learn more at https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/backend-code/web-modules/calling-backend-code-from-the-frontend

****/

/**** Call the sample multiply function below by pasting the following into your page code:

import { multiply } from 'backend/new-module.web';

$w.onReady(async function () {
   console.log(await multiply(4,5));
});

****/

import { Permissions, webMethod } from "wix-web-module";
import wixCaptchaBackend from "wix-captcha-backend";
import wixData from 'wix-data';

export const deleteMemorial = webMethod(
    Permissions.Anyone,
    async (id) => {

        try {
            const response = await wixData.remove("MemoriesProfile", id)
            return {
                status: 204,
                message: "the item is memorial is deleted successfully",
                data: response
            }
        } catch (error) {
            return {
                status: 400,
                message: "there is an error while deleting the item",
                error: error,
            }
        }
    }
);

export const getComments = webMethod(
    Permissions.Anyone,
    async (id) => {

        try {
            const response = await wixData.query("Comments")
                .eq("memorialid", id)
                .find();
            return {
                status: true,
                code: "200",
                message: "Data loaded succesfully",
                data: response
            }
        } catch (error) {
            return {
                status: false,
                code: "404",
                message: "no data is available",
                error: error,
            }
        }
    }
);

export const submitCommentWithCaptcha = webMethod(
    Permissions.Anyone,
    (submitRequestData) => {
        return wixCaptchaBackend
            .authorize(submitRequestData.token)
            .then(() => {
                return wixData
                    .insert("Comments", submitRequestData.data)
                    .then(() => ({ type: "success" }))
                    .catch((error) => ({
                        type: "insertion error",
                        message: "Error: comment insertion failed: " + error,
                    }));
            })
            .catch((error) => ({
                type: "authorization error",
                message: "Error: CAPTCHA authorization failed: " + error,
            }));
    },
);

export const deleteComment = webMethod(
    Permissions.Anyone,
    async (id) => {

        try {
            const response = await wixData.remove("Comments", id)
            return {
                status: true,
                code: 204,
                message: "the item is deleted successfully",
                data: response
            }
        } catch (error) {
            return {
                status: 400,
                message: "there is an error while deleting the item",
                error: error,
            }
        }
    }
);
