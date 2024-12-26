import wixData from "wix-data";
import wixWindowFrontend from "wix-window-frontend";
import { currentMember } from "wix-members-frontend";

let gallery = [];
let userId;
let newGallery = [];

// let data = {
//     gallery: gallery,
//     userId: userId,
//     memoryId: memId
// }

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
    console.log("member", userId);
    // Get the passed gallery data
    let data = wixWindowFrontend.lightbox.getContext();
    gallery = data.mediagallery

    console.log("gallery in lightbox: ", gallery);

    const processedGallery = gallery.map(item => ({
        ...item,
        src: convertWixUrl(item.src)

    }));

    console.log("processedGallery: ", processedGallery);

    // custom elememnt start 

    // Pass the processed gallery data to the custom element
    const customElement = $w("#gallery1");
    if (customElement) {
        customElement.setAttribute("data-gallery", JSON.stringify(processedGallery));
        console.log("data passed");

        customElement.on("gallery-reordered", (event) => {
            newGallery = event.detail;

            console.log("Gallery reordered:", newGallery);

            // Convert the reordered gallery back to the original format
            const revertedGallery = newGallery.map(item => ({
                ...item,
                src: revertToWixUrl(item)
            }));

            console.log("Reverted Gallery:", revertedGallery);

            // Update the `newGallery` to use reverted links
            newGallery = revertedGallery;
        });
    } else {
        console.error("Custom element #gallery1 not found.");
    }

    // cusotm elemenmt end

    //re-arrange photos / videos ------

    $w("#save").onClick(async () => {
        let toSave = {
            _id: data._id,
            ...data,
            mediagallery: newGallery,

        };

        await wixData
            .save("Gallery", toSave)
            .then((results) => {
                console.log(results); //see item below
                wixWindowFrontend.lightbox.close('close');
            })
            .catch((err) => {
                console.log(err);
            });
    })

    $w("#cancel").onClick(() => {
        wixWindowFrontend.lightbox.close('close');
    })

});

function convertWixUrl(wixUrl) {
    if (!wixUrl || typeof wixUrl !== "string") {
        console.warn("Invalid Wix URL:", wixUrl);
        return null;
    }

    // Check if it's a Wix image URL
    const imageMatch = wixUrl.match(/wix:image:\/\/v1\/([^\/]+)\/[^?#]+/);
    if (imageMatch && imageMatch[1]) {
        return `https://static.wixstatic.com/media/${imageMatch[1]}`;
    }

    // Check if it's a Wix video URL
    const videoMatch = wixUrl.match(/wix:video:\/\/v1\/([^\/]+)/);
    if (videoMatch && videoMatch[1]) {
        return `https://video.wixstatic.com/video/${videoMatch[1]}/720p/mp4/file.mp4`;
    }

    // Return the original URL if it's neither an image nor a video
    return wixUrl;
}

/**
 * Reverts usable formats back to Wix-specific formats
 */
function revertToWixUrl(item) {
    if (!item || typeof item.src !== "string") {
        console.warn("Invalid item or src:", item);
        return null;
    }

    if (item.type === "image") {
        const match = item.src.match(/https:\/\/static\.wixstatic\.com\/media\/([^\/]+)~mv2\.(png|jpg|jpeg)/);
        if (match && match[1]) {
            // Reconstruct the original image URL with the correct format
            return `wix:image://v1/${match[1]}~mv2.${match[2]}/image.jpg#originWidth=2940&originHeight=2112`; // Use actual width and height
        }
    } else if (item.type === "video") {
        const match = item.src.match(/https:\/\/video\.wixstatic\.com\/video\/([^\/]+)/);
        if (match && match[1]) {
            // Reconstruct the original video URL with posterUri and dimensions
            return `wix:video://v1/${match[1]}/HOME-Jssa.mp4#posterUri=${match[1]}f001.jpg&posterWidth=1280&posterHeight=720`;
        }
    }

    console.warn("Unrecognized format or type:", item);
    return item.src; // Return original src if no changes are made
}
