/* LIGHTBOX - the students' own code, with two fixes and one addition:
   1. It now finds gallery images in both layouts (.grid--masonry and .grid--masonry-sn);
      the original only looked for .grid--masonry, so it never opened on profile-first pages.
   2. It opens the largest optimised size of each image, not the small one shown in the grid.
   Added: an image's caption (if it has one) is shown under it in the lightbox. */
const galleryImages = document.querySelectorAll('.grid--masonry img, .grid--masonry-sn img');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxCaption = document.getElementById('lightbox-caption');
const closeButton = document.querySelector('.lightbox-close');
const previousButton = document.querySelector('.lightbox-prev');
const nextButton = document.querySelector('.lightbox-next');

let currentImage = 0;

function largestSource(image) {
    const srcset = image.getAttribute('srcset');
    if (!srcset) return image.currentSrc || image.src;
    let best = null;
    let bestWidth = 0;
    srcset.split(',').forEach((part) => {
        const bits = part.trim().split(/\s+/);
        const width = parseInt(bits[1], 10) || 0;
        if (width >= bestWidth) { bestWidth = width; best = bits[0]; }
    });
    return best || image.currentSrc || image.src;
}

/* OPEN IMAGE */
galleryImages.forEach((image, index) => {
    image.addEventListener('click', () => {
        currentImage = index;
        showImage();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

/* SHOW IMAGE */
function showImage() {
    lightboxImage.src = largestSource(galleryImages[currentImage]);
    lightboxImage.alt = galleryImages[currentImage].alt;
    const figure = galleryImages[currentImage].closest('figure');
    const caption = figure && figure.querySelector('figcaption');
    if (lightboxCaption) {
        lightboxCaption.textContent = caption ? caption.textContent.trim() : '';
        lightboxCaption.hidden = !lightboxCaption.textContent;
        lightbox.classList.toggle('has-caption', !lightboxCaption.hidden);
    }
}

/* NEXT IMAGE */
nextButton.addEventListener('click', () => {
    currentImage++;
    if (currentImage >= galleryImages.length) {
        currentImage = 0;
    }
    showImage();
});

/* PREVIOUS IMAGE */
previousButton.addEventListener('click', () => {
    currentImage--;
    if (currentImage < 0) {
        currentImage = galleryImages.length - 1;
    }
    showImage();
});

/* CLOSE */
closeButton.addEventListener('click', closeLightbox);

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

/* CLICK OUTSIDE IMAGE TO CLOSE */
lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox || event.target.classList.contains('lightbox-figure')) {
        closeLightbox();
    }
});

/* KEYBOARD CONTROLS */
document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('active')) {
        return;
    }
    if (event.key === 'ArrowRight') {
        currentImage++;
        if (currentImage >= galleryImages.length) {
            currentImage = 0;
        }
        showImage();
    }
    if (event.key === 'ArrowLeft') {
        currentImage--;
        if (currentImage < 0) {
            currentImage = galleryImages.length - 1;
        }
        showImage();
    }
    if (event.key === 'Escape') {
        closeLightbox();
    }
});
