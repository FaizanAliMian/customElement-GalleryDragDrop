import wixData from "wix-data";
import { currentMember } from "wix-members-frontend";
import wixWindowFrontend from "wix-window-frontend";
import { lightbox } from "wix-window-frontend";
import { uploadCroppedImage } from "backend/media";

let image;
let userId;

$w.onReady(async function () {
    let receivedData = lightbox.getContext();
    console.log("receivedData: ", receivedData)

    $w("#input1").value = receivedData.name;
    $w("#input2").value = receivedData.birthdateordeath;
    $w("#image10").src = receivedData.profilePic;
    image = receivedData.profilePic;

    // Pass the profile picture URL to the HTML component
    $w("#html3").postMessage(image);
    $w("#html3").onMessage(async (event) => {

        const base64Image = event.data; // The Base64 string of the cropped image
        console.log("Cropped Image (Base64):", base64Image);

        // Upload the cropped image to Wix Media Manager
        try {
            const fileName = `profile_${Date.now()}.jpg`; // Dynamic file name
            const uploadedUrl = await uploadCroppedImage(base64Image, fileName);
            console.log("Uploaded Image URL:", uploadedUrl);
            console.log("uploadedUrl: ", uploadedUrl)
            // Use the URL (e.g., display it, save to the database, etc.)
            $w("#image10").src = uploadedUrl; // Example: Display the image
            image = uploadedUrl;
            $w("#html3").collapse();
            
        } catch (error) {
            console.error("Image upload failed:", error);
        }

    });

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
                    image = uploadedFile.fileUrl;

                });

                $w("#submit").enable(); // Re-enable the submit button
            })
            .catch((uploadError) => {
                console.log(uploadError);
                $w("#submit").enable(); // Re-enable the submit button in case of error
            });
    });

    // Handle submit click
    $w("#submit").onClick(() => {

        if ($w("#input1").valid || $w("#input2").valid || $w("#uploadButton2").valid) {

            let titleValue = $w("#input1").value.trim(); // Trim any leading or trailing spaces
            let slugTitle = titleValue.replace(/\s+/g, '-'); // Replace all spaces with hyphens

            let toSave = {
                ...receivedData,
                profilePic: image,

                name: $w("#input1").value,

                birthdateordeath: $w("#input2").value,
            };

            // Insert a new record
            wixData.save("MemoriesProfile", toSave)
                .then((newItem) => {
                    console.log("New profile created: ", newItem);
                    $w("#text41").show();
                    lightbox.close();

                    // Set the _id of the newly inserted item as the title field
                    // wixData.save("MemoriesProfile", { ...newItem, title: newItem._id })
                    //     .then((updatedItem) => {
                    //         console.log("Updated title with _id: ", updatedItem);
                    //         lightbox.close("close");
                    //     })
                    //     .catch((updateError) => {
                    //         console.error("Error updating title: ", updateError);
                    //     });
                })
                .catch((err) => {
                    console.error("Error inserting gallery: ", err);
                });

        }
    });

    //crop btn
    $w("#cropBtn").onClick(() => {
        if ($w("#html3").collapsed) {
            $w("#html3").expand();
        } else {
            $w("#html3").collapse();
        }
    })
});
