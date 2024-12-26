// import wixLocationFrontend from "wix-location-frontend";
// import wixData from "wix-data";
// import { currentMember } from "wix-members-frontend";
// import { openLightbox } from "wix-window-frontend";

// let userId;
// let gallery = [];
// let newPath;

// $w.onReady(async function () {
//     await currentMember
//         .getMember()
//         .then((member) => {
//             userId = member._id;
//             console.log("Logged-in userId: ", userId);
//             return member;
//         })
//         .catch((error) => {
//             console.error(error);
//         });

//     newPath = wixLocationFrontend.path;
//     console.log("Current path: ", newPath);

//     await loadData(); // First load

//     if (newPath[2] == "gallery") {
//         $w("#group1").expand();
//         await loadData();
//     } else {
//         $w("#group1").collapse();
//     }

//     // Listen for changes in the path
//     wixLocationFrontend.onChange(async (location) => {
//         newPath = location.path; // Update path correctly
//         console.log("New path after change: ", newPath);
//         if (newPath[2] == "gallery") {
//             $w("#group1").expand();
//             await loadData(); // Load data again after path change
//         } else {
//             $w("#group1").collapse();
//         }
//     });

//     $w("#button15").onClick(async () => {
//         const lightBoxResponse = await openLightbox("album");

//         if (lightBoxResponse === "close") {
//             currentUserGallery();
//         }
//     });

//     $w("#button16").onClick(async () => {
//         const lightBoxResponse = await openLightbox("deleteMedia", gallery);

//         if (lightBoxResponse === "close") {
//             currentUserGallery(); // Reload the gallery after closing the lightbox
//         }
//     });
// });

// function clearGallery() {
//     $w("#gallery1").items = []; // Clear the gallery items
//     gallery = []; // Reset the gallery array
// }

// function currentUserGallery() {
//     clearGallery(); // Clear the gallery before loading new data

//     wixData
//         .query("Gallery")
//         .eq("userId", userId) // Query gallery by logged-in userId
//         .find()
//         .then((results) => {
//             if (results.items.length > 0) {
//                 console.log("Current user gallery:", results.items[0].mediagallery);

//                 $w("#gallery1").show();
//                 $w("#gallery1").items = results.items[0].mediagallery;
//                 gallery = results.items[0].mediagallery;
//             } else {
//                 $w("#gallery1").hide();
//             }
//         })
//         .catch((err) => {
//             console.log(err);
//         });
// }

// function otherUserGallery(id) {
//     clearGallery(); // Clear the gallery before loading new data

//     wixData
//         .query("Gallery")
//         .eq("userId", id) // Query gallery by other user's userId
//         .find()
//         .then((results) => {
//             if (results.items.length > 0) {
//                 console.log("Other user gallery:", results.items[0].mediagallery);

//                 $w("#gallery1").show();
//                 $w("#gallery1").items = results.items[0].mediagallery;
//                 gallery = results.items[0].mediagallery;
//             } else {
//                 $w("#gallery1").hide();
//             }
//         })
//         .catch((err) => {
//             console.log(err);
//         });
// }

// async function loadData() {
//     clearGallery(); // Always clear gallery before loading new data

//     // Fetch the current profile based on the path's slug
//     await wixData
//         .query("Members/FullData")
//         .eq("slug", newPath[1]) // Query the profile based on slug
//         .find()
//         .then((results) => {
//             if (results.items.length > 0) {
//                 const profile = results.items[0];
//                 console.log("Profile data: ", profile);
//                 console.log("Profile _id: ", profile._id);
//                 console.log("Logged-in userId: ", userId);

//                 // Check if the current profile belongs to the logged-in user
//                 if (profile._id === userId) {
//                     console.log("Loading current user profile gallery");
//                     currentUserGallery();
//                     $w("#button15").expand();
//                     $w("#button16").expand();
//                 } else {
//                     console.log("Loading other user profile gallery");
//                     otherUserGallery(profile._id);
//                     $w("#button15").collapse();
//                     $w("#button16").collapse();
//                 }
//             } else {
//                 console.log("No profile found for the given slug.");
//             }
//         })
//         .catch((err) => {
//             console.log("Error querying profile data:", err);
//         });
// }
