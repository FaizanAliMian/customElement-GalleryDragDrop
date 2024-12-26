class GalleryLightbox extends HTMLElement {
    constructor() {
        super();
        this.originalGallery = [];

    }

    static get observedAttributes() {
        return ["data-gallery"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "data-gallery" && newValue) {
            try {
                const galleryData = JSON.parse(newValue);
                this.originalGallery = galleryData;
                if (this.isInitialized) {
                    this.renderGallery(galleryData);
                } else {
                    this.pendingGallery = galleryData; // Store pending gallery data
                }
                console.log("Gallery received in custom element:", galleryData);
            } catch (error) {
                console.error("Failed to parse gallery data:", error);
            }
        }
    }

    connectedCallback() {
        console.log("GalleryLightbox connected to the page.");
        this.innerHTML = "";
        const styles = this.createStyles();
        const galleryContainer = this.init();
        this.appendChild(styles);
        this.appendChild(galleryContainer);

        this.isInitialized = true;

        if (this.pendingGallery) {
        this.renderGallery(this.pendingGallery);
        this.pendingGallery = null;
    }

        this.dispatchEvent(new Event("gallery-ready"));
        console.log("GalleryLightbox is ready.");
    }

    createStyles() {
        const style = document.createElement("style");
        style.textContent = `
            .gallery-container {
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
                justify-content: left;
                margin-top: 20px;
            }
            .box-wrapper {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }
            .box {
                position: relative;
                width: 150px;
                height: 150px;
                border: 2px solid transparent;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                border-radius: 8px;
                box-sizing: border-box;
                transition: transform 0.3s ease, border 0.3s ease;
                background-color: #f9f9f9;
            }
            .box img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 8px;
            }
            .box:hover {
                transform: scale(1.05);
                box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
            }
            .dragging {
                opacity: 0.5;
            }
        `;
        return style;
    }

    init() {
        const container = document.createElement("div");
        container.className = "gallery-container";
        container.id = "gallery-container";
        return container;
    }

    renderGallery(gallery) {
        const container = this.querySelector("#gallery-container");
        if (!container) {
            console.error("Gallery container not found in light DOM.");
            return;
        }
        if (!Array.isArray(gallery)) {
            console.error("Invalid gallery data: Expected an array.");
            return;
        }
        container.innerHTML = "";
        gallery.forEach((item, index) => {
            const boxWrapper = document.createElement("div");
            boxWrapper.className = "box-wrapper";
            boxWrapper.draggable = true;
            boxWrapper.dataset.index = index;

            const box = document.createElement("div");
            box.className = "box";

            const img = document.createElement("img");
            img.src = item.src;
            img.alt = "Gallery Item";
            if (item.type === "image") {
                const img = document.createElement("img");
                img.src = item.src;
                img.alt = "Gallery Image";
                box.appendChild(img);
            } else if (item.type === "video") {
                const video = document.createElement("video");
                video.src = item.src;
                video.controls = true; // Add video controls
                video.style.width = "100%";
                video.style.height = "100%";
                video.style.objectFit = "cover"; // Match the image style
                const posterUrl = item.settings?.posters?.[0]?.url ?
                    `https://static.wixstatic.com/media/${item.settings.posters[0].url}` :
                    "https://via.placeholder.com/150"; // Fallback if no poster exists
                video.poster = posterUrl;
                box.appendChild(video);
            } else {
                console.warn("Unknown gallery item type:", item.type);
            }

            // box.appendChild(img);
            boxWrapper.appendChild(box);
            container.appendChild(boxWrapper);

            // Add drag event listeners
            boxWrapper.addEventListener("dragstart", this.handleDragStart.bind(this));
            boxWrapper.addEventListener("dragover", this.handleDragOver.bind(this));
            boxWrapper.addEventListener("drop", this.handleDrop.bind(this));
            boxWrapper.addEventListener("dragend", this.handleDragEnd.bind(this));
        });
    }

    handleDragStart(event) {
        event.currentTarget.classList.add("dragging");
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", event.currentTarget.dataset.index);
    }

    handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }

    handleDrop(event) {
        event.preventDefault();
        const draggedIndex = event.dataTransfer.getData("text/plain");
        const targetIndex = event.currentTarget.dataset.index;
        if (draggedIndex !== targetIndex) {
            this.reorderGallery(draggedIndex, targetIndex);
        }
    }

    handleDragEnd(event) {
        event.currentTarget.classList.remove("dragging");
    }

    reorderGallery(draggedIndex, targetIndex) {
        const gallery = [...this.originalGallery];
        const [movedItem] = gallery.splice(draggedIndex, 1);
        gallery.splice(targetIndex, 0, movedItem);
        this.originalGallery = gallery;
        this.renderGallery(gallery);
        this.dispatchEvent(new CustomEvent("gallery-reordered", { detail: gallery }));
    }
}

// Define the custom element
customElements.define("my-gallery", GalleryLightbox);
