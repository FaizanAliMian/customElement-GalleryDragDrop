import wixData from "wix-data";
import wixLocation from "wix-location";
import { lightbox } from "wix-window-frontend";
import { currentMember } from "wix-members-frontend";
import { getComments } from 'backend/memorial.web';

let userId;

$w.onReady(async function () {
    // Get current member
    await currentMember.getMember()
        .then(member => {
            userId = member._id;
        })
        .catch(error => {
            console.error("Member error: ", error);
        });

    // Get data from lightbox context
    let profileData = lightbox.getContext();

    // Extract the slug from the full URL and set it as the input value
    let fullSlug = profileData["link-memories-profile-title-2"];

    console.log("fullSlug: ", fullSlug);
    let extractedSlug = fullSlug.split("/").pop();
    console.log("extractedSlug: ", extractedSlug);

    $w("#input1").value = extractedSlug;

    // Submit button for updating slug and duplicating profile
    $w("#submit").onClick(async () => {
        $w("#loading").expand();
        $w("#submit").disable()
        // Check if the input is valid
        if ($w("#input1").valid) {
            let customSlug = $w("#input1").value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
            console.log("customSlug: ", customSlug);

            // Check for duplicate slug in the database
            let duplicate = await wixData.query("MemoriesProfile")
                .eq("link-memories-profile-title-2", `/memorials/${customSlug}`)
                .find();
            if (duplicate.items.length > 0) {
                $w("#text43").show();
                $w("#loading").collapse();
                $w("#submit").enable()
                setTimeout(() => {
                    $w("#text43").hide();
                }, 3000);
                return
            }
            // Create a new profile with the same data but new slug (duplicating the profile)
            let newProfile = {
                ...profileData,
                title: customSlug, // Update the title with the custom slug
                _id: undefined, // Set undefined to generate a new ID for the profile
                "link-memories-profile-title-2": `/memorials/${customSlug}` // Update the link field for the new slug with full URL pattern
            };

            // Insert the new profile with custom URL slug
            wixData.insert("MemoriesProfile", newProfile)
                .then(async (newProfileItem) => {
                    console.log("New profile created: ", newProfileItem);

                    // Duplicate the gallery for the new profile
                    await duplicateGallery(profileData._id, newProfileItem._id);

                    //duplicate tributes
                    await duplicateTribute(profileData._id, newProfileItem._id);

                    // Remove the old profile
                    await wixData.remove("MemoriesProfile", profileData._id)
                        .then(() => {
                            console.log("Old profile removed.");
                        })
                        .catch(error => {
                            console.error("Error removing old profile: ", error);
                        });

                    // Redirect to the new profile URL
                    wixLocation.to(newProfileItem['link-memories-profile-title-2']);
                })
                .catch(error => {
                    console.error("Error creating new profile: ", error);
                });
        }
    });
});

// Function to duplicate gallery
async function duplicateGallery(oldProfileId, newProfileId) {
    // Fetch gallery items associated with the old profile
    try {
        let results = await wixData.query("Gallery").eq("memoryId", oldProfileId).find();
        if (results.items.length > 0) {
            let oldGallery = results.items[0].mediagallery;
            let newGallery = {
                _id: results.items[0]._id,
                mediagallery: oldGallery,
                userId: userId,
                memoryId: newProfileId // Link to the new profile
            };

            // Insert the new gallery for the duplicated profile
            await wixData.update("Gallery", newGallery);
            console.log("Gallery updated for new profile.");

        } else {
            console.log("No gallery found for the original profile.");
        }
    } catch (error) {
        console.error("Error duplicating gallery: ", error);
    }
}

// Function to duplicate and update tribute comments
async function duplicateTribute(oldProfileId, newProfileId) {
    try {
        // Fetch comments associated with the old profile using the getComments function
        const response = await getComments(oldProfileId);

        if (response.data.items.length > 0) {
            console.log("Original Comments: ", response.data.items);

            // Prepare updated comments with the new memorialid
            let updatedComments = response.data.items.map(comment => {
                return {
                    ...comment,
                    memorialid: newProfileId, // Update the memorialid

                };
            });

            console.log("Updated Comments: ", updatedComments);

            // Insert each updated comment into the database
            for (let comment of updatedComments) {
                await wixData.save("Comments", comment)
                    .then(() => {
                        console.log("Comment updated successfully:", comment);
                    })
                    .catch(error => {
                        console.error("Error inserting comment:", error);
                    });
            }

            console.log("All comments updated for the new profile.");
        } else {
            console.log("No comments found for the original profile.");
        }
    } catch (error) {
        console.error("Error duplicating and updating tributes: ", error);
    }
}
