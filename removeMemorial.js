
import wixWindow from 'wix-window';
import { deleteMemorial } from 'backend/memorial.web';
$w.onReady(async function () {

	const id = await wixWindow.lightbox.getContext();
     console.log("this is the of the Memorail that i want to delete" ,id); 
	 $w('#yesDelete').onClick(async (event) => {
       try {
		const response =  await deleteMemorial(id) ; 
		if(response.status == "204") {
			console.log("the item is deleyed"); 
			await wixWindow.lightbox.close(response.status)
		} else {
			console.log("the item is not deleted ");
		}
	   } catch (error) {
		console.log("error :", error);
	   }        
})
});



$w('#notdelete').onClick(async(event) => {
      await wixWindow.lightbox.close("400")
})
