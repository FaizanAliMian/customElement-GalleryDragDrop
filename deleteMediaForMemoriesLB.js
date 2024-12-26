import wixData from "wix-data";
import wixWindowFrontend from "wix-window-frontend";
import { currentMember } from "wix-members-frontend";

let gallery = [];
let userId;

$w.onReady(async function () {
    await currentMember
        .getMember()
        .then((member) => {
            userId = member._id;
            return member;
        })
        .catch((error) => {
            console.error(error);
        });

    // Get the passed gallery data
    let data = wixWindowFrontend.lightbox.getContext();
    gallery = data.gallery

    console.log("gallery in lightbox: ", gallery);

    // Add unique `_id` to each gallery item
    gallery = gallery.map((item, index) => {
        return {
            ...item, // Keep existing properties (type, src, etc.)
            _id: String(index) // Add a unique _id field (string version of index)
        };
    });

    // Bind the updated gallery data to the repeater
    $w("#repeater1").data = gallery;

    // Use onItemReady to handle each repeater item
    $w("#repeater1").onItemReady(($item, itemData, index) => {
        let currentItem = itemData; // itemData now contains the gallery data for this item

        // Check if the current item is an image or video
        if (currentItem.type === "image") {
            $item("#imageElement").src = currentItem.src;
            $item("#videoElement").hide();
            $item("#imageElement").show();
        } else if (currentItem.type === "video") {
            $item("#videoElement").src = currentItem.src;
            $item("#imageElement").hide();
            $item("#videoElement").show();
        }

        // Add delete functionality to the delete button using _id for correct identification
        $item("#deleteButton").onClick(() => {
            deleteMedia(currentItem._id); // Pass the unique _id instead of the index
        });
    });

    wixWindowFrontend.lightbox.close("close");

    // Function to delete media and update the gallery
    function deleteMedia(itemId) {
        // Find the item by _id and remove it from the gallery array
        gallery = gallery.filter(item => item._id !== itemId);

        // Query the database to find the existing gallery record for the user
        wixData.query("Gallery")
            .eq("userId", userId)
            .eq("memoryId", data.memoryId)
            .find()
            .then((results) => {
                if (results.items.length > 0) {
                    let item = results.items[0];

                    // Update the mediagallery by removing the deleted media
                    item.mediagallery = gallery;

                    // Update the gallery field in the database
                    wixData.update("Gallery", item)
                        .then(() => {
                            // Log success message
                            console.log("Gallery updated successfully after deletion.");
                            // Clear repeater data to ensure it refreshes properly
                            $w("#repeater1").data = [];

                            // Re-bind the updated gallery array to the repeater
                            $w("#repeater1").data = gallery.map((item, index) => ({
                                ...item,
                                _id: String(index) // Re-generate unique _id after deletion
                            }));
                        })
                        .catch((err) => {
                            console.error("Error updating gallery: ", err);
                        });
                }
            })
            .catch((err) => {
                console.error("Error querying gallery: ", err);
            });
    }

});
