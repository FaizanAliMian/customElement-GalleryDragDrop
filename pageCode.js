import wixData from 'wix-data';
import { currentMember } from "wix-members-frontend";
let gallery = [];
let newGallery = [];
$w.onReady(async function () {
    const username = "Alice";
    try {

        const result = await wixData.query("TestGallery")
            .eq("userId", username) // Adjust "username" to the field name in your collection
            .find();

        if (result.items.length === 0) {
            console.warn(`No gallery found for username: ${username}`);
            return;
        }

        // Assume there's one record per username; adjust logic if needed
        const userRecord = result.items[0];
        const gallery = userRecord.mediagallery || []; // Replace "mediagallery" with your actual field key
        console.log("Fetched gallery:", gallery);

        const processedGallery = gallery.map(item => ({
            ...item,
            src: convertWixImageUrl(item.src)

        }));
        console.log(processedGallery);

        // Pass the processed gallery data to the custom element
        const customElement = $w("#gallery1");
        if (customElement) {
            setTimeout(() => {
                customElement.setAttribute("data-gallery", JSON.stringify(processedGallery));
            }, 5000);
            console.log("data passed");

            customElement.on("gallery-reordered", (event) => {
                newGallery = event.detail;
                console.log("Gallery reordered:", newGallery);
                // Handle the updated gallery order as needed
                // For example, update the server or local storage
            });
        } else {
            console.error("Custom element #gallery1 not found.");
        }
        $w("#save").onClick(async () => {

            const toSave = {
                ...userRecord,
                mediagallery: newGallery.length > 0 ? newGallery : gallery, // Save reordered or original gallery
            };

            await wixData
                .save("TestGallery", toSave)
                .then((results) => {
                    console.log("Saved successfully:", results);

                })
                .catch((err) => {
                    console.error("Error saving data:", err);
                });
        });

    } catch (error) {
        console.log(error);

    }

});

function convertWixImageUrl(wixUrl) {
    if (!wixUrl || typeof wixUrl !== "string") {
        console.warn("Invalid Wix URL:", wixUrl);
        return null;
    }

    const match = wixUrl.match(/wix:image:\/\/v1\/([^\/]+)\/[^?#]+/);
    if (match && match[1]) {
        return `https://static.wixstatic.com/media/${match[1]}`;
    }
    return wixUrl; // Return original URL if not a Wix image
}

// let gallery = [{
//         type: "image",
//         src: "wix:image://v1/d71c2e_0f301372ce4547dba8534f0ed059044d~mv2.webp/tributes.webp#originWidth=898&originHeight=424"
//     },
//     {
//         type: "image",
//         src: "wix:image://v1/d71c2e_d3f68d4bd604478a8c7d0505b0dc3b2b~mv2.png/PickleX-Indoor-Pickleball-in-Plymouth-12-13-2024_05_33_PM.png#originWidth=1920&originHeight=1165"
//     },
//     {
//         type: "image",
//         src: "wix:image://v1/d71c2e_84d47ef381a04caf8080292d4430a4d8~mv2.webp/Screenshot%202024-11-17%20111331.webp#originWidth=1114&originHeight=519"
//     },
//     {
//         type: "image",
//         src: "wix:image://v1/d71c2e_b786e000a2534656b1a338037982110a~mv2.webp/links.webp#originWidth=718&originHeight=800"
//     },
//     {
//         type: "image",
//         src: "wix:image://v1/d71c2e_c548bc3463694f81b4c62e572dc497a7~mv2.webp/Screenshot%202024-11-18%20135715.webp#originWidth=1131&originHeight=573"
//     },

// ];
