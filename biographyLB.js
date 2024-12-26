import wixData from "wix-data";
import { currentMember } from "wix-members-frontend";
import { lightbox } from "wix-window-frontend";

let images = [];
let userId;
let currentItem;

$w.onReady(async function () {
    let data = lightbox.getContext();

    // Get the current logged-in member
    await currentMember
        .getMember()
        .then((member) => {
            userId = member._id;
            const fullName = `${member.contactDetails.firstName} ${member.contactDetails.lastName}`;
            return member;
        })
        .catch((error) => {
            console.error(error);
        });

    // Retrieve existing data for the current user
    wixData.query("MemoriesProfile")
        .eq("_id", data._id) // Assuming data._id is passed through lightbox context
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                currentItem = results.items[0];
                // Populate fields with existing data
                $w("#textBox1").value = currentItem.biographyText || "";
                images = currentItem.biographyMedia || [];
                $w("#input3").value = currentItem.obituaryLink || "";
                $w("#input4").value = currentItem.facebookLink || "";
                $w("#input5").value = currentItem.instagramLink || "";
                $w("#input6").value = currentItem.youtubeChannel || "";
            }
        })
        .catch((error) => {
            console.error("Error retrieving existing data: ", error);
        });

    // Handle file upload
    // $w("#uploadButton2").onChange(() => {
    //     $w("#submit").disable(); // Disable the submit button while uploading
    //     $w("#uploadButton2")
    //         .uploadFiles()
    //         .then((uploadedFiles) => {
    //             uploadedFiles.forEach((uploadedFile) => {
    //                 // Determine if the file is an image or a video based on its URL
    //                 let fileType = uploadedFile.fileUrl.startsWith("wix:image://") ? "image" : "video";

    //                 // Add the uploaded file to the images array
    //                 images.push({
    //                     type: fileType, // "image" or "video"
    //                     src: uploadedFile.fileUrl,
    //                 });
    //             });

    //             console.log("images: ", images);
    //             $w("#submit").enable(); // Re-enable the submit button
    //         })
    //         .catch((uploadError) => {
    //             console.log(uploadError);
    //             $w("#submit").enable(); // Re-enable the submit button in case of error
    //         });
    // });

    // Handle submit click
    $w("#submit").onClick(() => {
        if ($w("#textBox1").valid) {
            let toUpdate = {
                ...currentItem,
                biographyText: $w("#textBox1").value,

                obituaryLink: $w("#input3").value,
                facebookLink: $w("#input4").value,
                instagramLink: $w("#input5").value,
                youtubeChannel: $w("#input6").value,
            };

            // Update the existing record
            wixData.update("MemoriesProfile", toUpdate)
                .then((updatedItem) => {
                    console.log("biography updated: ", updatedItem);
                    $w("#text41").show();
                    lightbox.close("close");
                })
                .catch((err) => {
                    console.error("Error updating biography: ", err);
                });
        }
    });
});
