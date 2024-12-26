import wixData from "wix-data";
import { currentMember } from "wix-members-frontend";
import wixWindowFrontend from "wix-window-frontend";
import { lightbox } from "wix-window-frontend";

let image;
let userId;

$w.onReady(async function () {

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

        if ($w("#input1").valid && $w("#input2").valid && $w("#uploadButton2").valid) {

            let titleValue = $w("#input1").value.trim(); // Trim any leading or trailing spaces
            let slugTitle = titleValue.replace(/\s+/g, '-'); // Replace all spaces with hyphens

            let toInsert = {
                profilePic: image,
                userId: userId,
                name: $w("#input1").value,
                title: slugTitle,
                birthdateordeath: $w("#input2").value,
            };

            // Insert a new record
            wixData.insert("MemoriesProfile", toInsert)
                .then((newItem) => {
                    console.log("New profile created: ", newItem);
                    $w("#text41").show();
                    
                    // Set the _id of the newly inserted item as the title field
                    wixData.save("MemoriesProfile", { ...newItem, title: newItem._id })
                        .then((updatedItem) => {
                            console.log("Updated title with _id: ", updatedItem);
                            lightbox.close("close");
                        })
                        .catch((updateError) => {
                            console.error("Error updating title: ", updateError);
                        });
                })
                .catch((err) => {
                    console.error("Error inserting gallery: ", err);
                });

        }
    });
});
