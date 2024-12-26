import wixLocationFrontend from "wix-location-frontend";
import wixData from "wix-data";
import { currentMember } from "wix-members-frontend";
import { openLightbox, lightbox } from "wix-window-frontend";
import wixWindowFrontend from "wix-window-frontend";
import { getComments, submitCommentWithCaptcha, deleteComment } from 'backend/memorial.web';

let userId;
let gallery = [];
let memId;
let mediaRearrange;

$w.onReady(async function () {
    disableForm();
    await currentMember
        .getMember()
        .then((member) => {
            userId = member._id;
            console.log("Logged-in userId: ", userId);
            return member;
        })
        .catch((error) => {
            console.error(error);
        });

    let data = await $w("#dynamicDataset").getCurrentItem();
    memId = data._id;

    refreshProfileLinks(data);

    $w("#text51").text = "https://www.memorialpics.com" + data['link-memories-profile-title-2'];

    await currentUserGallery();
    checkBiography();
    mangeTributes();

    //edit profile

    $w("#editProfile").onClick(() => {

        wixWindowFrontend.openLightbox("edit Profile", data).then(async (datas) => {

            let receivedData = datas;
            await $w("#dynamicDataset").refresh();
        });

    })

    // create biography
    $w("#button17").onClick(async () => {
        const lightBoxResponse = await openLightbox("createBiography", data);

        if (lightBoxResponse === "close") {
            await $w("#dynamicDataset").refresh();
            let refreshedData = await $w("#dynamicDataset").getCurrentItem();
            refreshProfileLinks(refreshedData);
            checkBiography();
        }
    });

    // edit link
    $w("#button18").onClick(async () => {
        const lightBoxResponse = await openLightbox("editURL", data);

        if (lightBoxResponse) {
            wixLocationFrontend.to(lightBoxResponse['link-memories-profile-title-2']);
        }
    });

    $w("#button15").onClick(async () => {
        const lightBoxResponse = await openLightbox("albumformemories", memId);

        if (lightBoxResponse === "close") {
            currentUserGallery();
        }
    });

    $w("#button16").onClick(async () => {
        let data = {
            gallery: gallery,
            userId: userId,
            memoryId: memId
        }
        const lightBoxResponse = await openLightbox("deleteMediaformemories", data);

        if (lightBoxResponse === "close") {
            currentUserGallery(); // Reload the gallery after closing the lightbox
        }
    });

    //rearrange lightbox
    $w("#rearrangeBtn").onClick(async () => {

        const lightBoxResponse = await openLightbox("RearrangeMedia", mediaRearrange);

        if (lightBoxResponse === "close") {
            currentUserGallery();
        }
    });

    function currentUserGallery() {

        wixData
            .query("MemoriesProfile")
            .eq("_id", data._id)
            .eq("userId", userId)
            .find()
            .then((results) => {
                if (results.items.length > 0) {
                    console.log(results.items[0]); //see item below
                    $w("#button15").expand()
                    $w("#button16").expand()
                    $w("#rearrangeBtn").expand()

                } else {
                    // handle case where no matching items found
                    $w("#button15").collapse()
                    $w("#button16").collapse()
                    $w("#rearrangeBtn").collapse()

                }
            })
            .catch((err) => {
                console.log(err);
            });

        wixData
            .query("Gallery")
            .eq("memoryId", data._id)
            .find()
            .then((results) => {
                if (results.items.length > 0) {
                    console.log("Current user gallery:", results.items[0].mediagallery);

                    $w("#gallery1").expand();
                    $w("#text42").collapse();
                    $w("#gallery1").items = results.items[0].mediagallery;
                    gallery = results.items[0].mediagallery;
                    mediaRearrange = results.items[0];

                } else {
                    $w("#gallery1").collapse();
                    $w("#text42").expand();
                }
            })
            .catch((err) => {
                console.log(err);
            });

    }

    async function checkBiography() {
        $w("#dynamicDataset").refresh()
        let data1 = await $w("#dynamicDataset").getCurrentItem();
        console.log("data.biographyText: ", data1.biographyText)
        console.log("data.biographyMedia : ", data1.biographyMedia)
        if ((data1.biographyText == undefined || data1.biographyText == '') && data1.biographyMedia == undefined) {
            $w("#text43").expand();
            $w("#button17").label = "Create Biography";

            $w("#box2").collapse();

        } else {
            $w("#text43").collapse();
            $w("#button17").label = "Edit Biography";
            $w("#box2").expand();
        }

        wixData
            .query("MemoriesProfile")
            .eq("_id", data._id)
            .eq("userId", userId)
            .find()
            .then((results) => {
                if (results.items.length > 0) {
                    console.log(results.items[0]); //see item below

                    $w("#button17").expand()
                    $w("#text50").expand()
                    $w("#text51").expand()
                    $w("#button18").expand()
                    $w("#editProfile").expand()
                    $w("#tributeForm").collapse() //for admin 
                    $w("#captchaElement").hide();
                    $w("#deleteComment").expand() //for admin

                } else {
                    // handle case where no matching items found

                    $w("#button17").collapse()
                    $w("#text50").collapse()
                    $w("#text51").collapse()
                    $w("#button18").collapse()
                    $w("#editProfile").collapse()
                    $w("#tributeForm").expand() //for public
                    $w("#deleteComment").collapse() //for public

                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

    async function refreshProfileLinks(data) {
        console.log("the refresh function is called");
        console.log("data.obituaryLink: ", data.obituaryLink)

        // if (data.obituaryLink == "") {
        //     $w("#text46").text = data.obituaryLink;
        // }

        if (data.obituaryLink != undefined || data.obituaryLink != "") {
            $w("#text46").text = data.obituaryLink || "Not Provided";
        } else {
            $w("#text46").text = "Not Provided";
        }

        if (data.facebookLink == undefined || data.facebookLink == "") {

            $w("#vectorImage1").hide();
        } else {

            $w("#vectorImage1").link = data.facebookLink;
            $w("#vectorImage1").show();
        }

        if (data.instagramLink == undefined || data.instagramLink == "") {

            $w("#vectorImage2").hide();
        } else {
            $w("#vectorImage2").link = data.instagramLink;
            $w("#vectorImage2").show();

        }

        if (data.youtubeChannel == undefined || data.youtubeChannel == "") {

            $w("#vectorImage3").hide();
        } else {
            $w("#vectorImage3").link = data.youtubeChannel;
            $w("#vectorImage3").show();

        }
    }
});

async function mangeTributes() {

    // if (!memId) return; 

    const response = await getComments(memId)
    console.log("getComments() response :", response);
    console.log("this is the id of the meorial", memId);
    // if (!response.status === true) return;
    if (response.data.items.length > 0) {
        $w("#commentsRepeater").data = response.data.items;
        $w("#text53").collapse();
    } else {
        $w("#commentsRepeater").data = [];
        $w("#text53").expand();
    }

    $w("#commentsRepeater").onItemReady(($item, itemData) => {
        $item("#name").text = itemData.name;
        $item("#comment").text = itemData.comment;
        $item("#deleteComment").onClick(async () => {
            const response = await deleteComment(itemData._id);
            console.log("this item is deleted from the database", response);
            if (response.status == true)
                await mangeTributes();
        })
    })
}

$w('#submitBtn').onClick(async (event) => {
    try {
        // Validate CAPTCHA
        const token = $w("#captchaElement").token; // Ensure you have a CAPTCHA element on the page
        if (!token) {
            $w("#messageText").text = "Please complete the CAPTCHA.";
            $w("#messageText").show();
            return;
        }

        // Collect comment data
        const toInsert = {
            email: $w("#senderEmail").value,
            name: $w("#senderName").value,
            comment: $w("#senderComment").value,
            memorialid: memId,
        };

        // Call backend function
        const response = await submitCommentWithCaptcha({ token, data: toInsert });

        // Handle response
        switch (response.type) {
        case "success":
            $w("#messageText").text = "Comment submitted successfully!";
            await mangeTributes(); // Refresh comments
            $w("#senderEmail").value = "";
            $w("#senderName").value = "";
            $w("#senderComment").value = "";
            break;
        case "authorization error":
            $w("#messageText").text =
                "CAPTCHA verification failed. Please try again.";
            break;
        case "insertion error":
            $w("#messageText").text =
                "Error submitting comment. Please try again later.";
            break;
        }
        $w("#messageText").show();
        setTimeout(() => {
            $w("#messageText").hide();
        }, 3500);
        $w("#captchaElement").reset(); // Reset CAPTCHA
          $w("#captchaElement").expand();
          $w("#captchaElement").show();
    } catch (error) {
        console.log("Error submitting comment:", error);
        $w("#messageText").text = "Unexpected error. Please try again.";
        $w("#messageText").show();
    }
});

// CAPTCHA timeout handler
$w("#captchaElement").onVerified(() => {
    $w("#captchaElement").hide();
    enableForm(); // Enable fields and button when CAPTCHA is verified
    $w("#messageText").hide(); // Hide any messages related to CAPTCHA
});

$w("#captchaElement").onError(() => {
    $w("#messageText").text =
        "The CAPTCHA element encountered an error. Please refresh the page.";
    $w("#messageText").show();
    disableForm(); // Keep form disabled if CAPTCHA fails to load
});

// $w("#captchaElement").onTimeout(() => {
//     $w("#submitBtn").disable();
//     $w("#messageText").text =
//         "The CAPTCHA has timed out. Please redo the CAPTCHA challenge.";
//     $w("#messageText").show();
//     disableForm(); // Keep form disabled on timeout
// });

function disableForm() {
    $w("#submitBtn").disable();
    $w("#messageText").hide();
}

function enableForm() {
    $w("#submitBtn").enable();
}
