import wixData from "wix-data";
import { currentMember } from "wix-members-frontend";
import { openLightbox } from "wix-window-frontend";

let userId;
$w.onReady(async function () {

    await loadProfiles()

    $w("#button15").onClick(async () => {
        const lightBoxResponse = await openLightbox("Add New Profile");

        if (lightBoxResponse === "close") {
            loadProfiles();
        }
    });

    async function loadProfiles() {
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

        await wixData
            .query("MemoriesProfile")
            .eq("userId", userId)
            .find()
            .then((results) => {
                if (results.items.length > 0) {
                    console.log(results.items[0]); //see firstItem below
                    $w("#repeater1").data = results.items
                } else {
                    // handle case where no matching items found
                    $w("#repeater1").data = []
                }
            })
            .catch((err) => {
                console.log(err);
            });

        $w("#repeater1").onItemReady(async ($item, itemData, index) => {
            $item("#image10").src = itemData.profilePic;
            $item("#text40").text = itemData.name;
            $item("#text41").text = itemData.birthdateordeath; 
            $item("#removeIcon").onClick(async()=>{
                const lightboxresponse = await openLightbox("remove memorial",itemData._id)  
                console.log("this is the response that we get from the repeater",lightboxresponse);
                if(lightboxresponse === 204) {
                    loadProfiles();
                }  
            })

            $item("#button17").link = itemData['link-memories-profile-title-2']
                                               
        });

    }

});

