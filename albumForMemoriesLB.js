import wixData from "wix-data";
import { currentMember } from "wix-members-frontend";
import wixWindowFrontend from "wix-window-frontend";
import { lightbox } from "wix-window-frontend";

let images = [];
let userId;

$w.onReady(async function () {
    let receivedData = lightbox.getContext();
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

    // Handle file upload
    $w("#uploadButton2").onChange(() => {
        $w("#submit").disable(); // Disable the submit button while uploading
        $w("#uploadButton2")
            .uploadFiles()
            .then((uploadedFiles) => {
                uploadedFiles.forEach((uploadedFile) => {
                    // Determine if the file is an image or a video based on its URL
                    let fileType = uploadedFile.fileUrl.startsWith("wix:image://") ? "image" : "video";

                    // Add the uploaded file to the images array
                    images.push({
                        type: fileType, // "image" or "video"
                        src: uploadedFile.fileUrl,
                    });
                });

                console.log("images: ", images)
                $w("#submit").enable(); // Re-enable the submit button
            })
            .catch((uploadError) => {
                console.log(uploadError);
                $w("#submit").enable(); // Re-enable the submit button in case of error
            });
    });

    // Handle submit click
    $w("#submit").onClick(() => {
        if (images.length > 0) {
            // Check if the user already has a record in the "Gallery" collection
            wixData.query("Gallery")
                .eq("memoryId", receivedData)
                .find()
                .then((results) => {
                    if (results.items.length > 0) {
                        // User already has a gallery record, so update it by concatenating the new images
                        let existingItem = results.items[0];
                        existingItem.mediagallery = existingItem.mediagallery.concat(images); // Concatenate new images

                        // Update the existing gallery record
                        wixData.update("Gallery", existingItem)
                            .then((updatedItem) => {
                                console.log("Gallery updated: ", updatedItem);
                                $w("#text41").show();
                                lightbox.close("close");
                            })
                            .catch((err) => {
                                console.error("Error updating gallery: ", err);
                            });
                    } else {
                        // No existing record, so insert a new gallery record
                        let toInsert = {
                            mediagallery: images,
                            userId: userId,
                            memoryId: receivedData
                        };

                        // Insert a new record
                        wixData.insert("Gallery", toInsert)
                            .then((newItem) => {
                                console.log("New gallery inserted: ", newItem);
                                $w("#text41").show();
                                lightbox.close("close");
                            })
                            .catch((err) => {
                                console.error("Error inserting gallery: ", err);
                            });
                    }
                })
                .catch((err) => {
                    console.error("Error querying gallery: ", err);
                });
        }
    });
});
