class PortfolioShowcase {
    constructor() {
        this.projects = [];
        this.modal = document.getElementById('project-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalDescription = document.getElementById('modal-description');
        this.modalGallery = document.getElementById('modal-gallery');
        this.visitButton = document.getElementById('visit-source');
        this.closeButton = document.getElementById('close-modal');
        this.portfolioGrid = document.getElementById('portfolio-grid');
        
        this.init();
    }
    
    async init() {
        await this.loadProjectData();
        this.createProjectCards();
        this.setupModalHandlers();
    }
    
    async loadProjectData() {
        try {
            const response = await fetch('./json/site_data.json');
            this.projects = await response.json();
        } catch (error) {
            console.error('Error loading project data:', error);
            // Fallback data in case JSON loading fails
            this.projects = [];
        }
    }
    
    createProjectCards() {
        this.portfolioGrid.innerHTML = '';
        
        // Show all 6 projects for the bento box layout
        const projectsToShow = this.projects.slice(0, 6);
        
        projectsToShow.forEach((project, index) => {
            const card = this.createCard(project, index);
            this.portfolioGrid.appendChild(card);
        });
    }
    
    createCard(project, index) {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.setAttribute('data-project-index', index);
        
        const projectSlug = this.createSlug(project.name);
        const cardImageSrc = this.getCardImage(projectSlug);
        
        card.innerHTML = `
            <img src="${cardImageSrc}" alt="${project.name}" class="card-image" 
                 onerror="this.style.display='none'">
            <h3 class="card-title">${project.name}</h3>
        `;
        
        card.addEventListener('click', () => this.openModal(project, index));
        
        return card;
    }
    
    createSlug(name) {
        // Handle special cases for image file naming
        const nameMap = {
            'Amira and the Story Craft': 'amira_and_the_storycraft',
            'PBS Kids Play And Learn Science': 'play_and_learn_science',
            'PBS Kids Play And Learn Engineering': 'play_and_learn_engineering',
            'Jelly Ben And Pogo': 'jelly_ben_and_pogo',
            'Visiting the doctor': 'visiting_the_doctor',
            'Bajillions Early Math': 'bajillions' // Use the actual image naming
        };
        
        return nameMap[name] || name.toLowerCase()
                                     .replace(/\s+/g, '_')
                                     .replace(/[^a-z0-9_]/g, '');
    }
    
    getCardImage(projectSlug) {
        // Try card image first, then fallback to main image
        const cardImage = `./images/${projectSlug}_card.png`;
        const mainImage = `./images/${projectSlug}.png`;
        
        // We'll return the card image path and let onerror handle fallback
        return cardImage;
    }
    
    getGalleryImages(projectSlug) {
        const galleryImages = [];
        
        // Handle special cases for projects with different image naming
        if (projectSlug === 'bajillions') {
            return [
                `./images/${projectSlug}_card.png`,
                `./images/${projectSlug}_gameplay1.png`,
                `./images/${projectSlug}_gameplay2.png`
            ];
        }
        
        // Standard image naming for other projects
        const baseImages = [
            `./images/${projectSlug}.png`,
            `./images/${projectSlug}_gameplay.png`,
            `./images/${projectSlug}_gameplay1.png`,
            `./images/${projectSlug}_gameplay2.png`,
            `./images/${projectSlug}_gameplay3.png`
        ];
        
        return baseImages;
    }
    
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }
    
    openModal(project, index) {
        const projectSlug = this.createSlug(project.name);
        
        this.modalTitle.textContent = project.name;
        this.modalDescription.textContent = project.description;
        this.visitButton.href = project.website;
        
        this.createImageGallery(projectSlug);
        
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    
    createImageGallery(projectSlug) {
        const galleryImages = this.getGalleryImages(projectSlug);
        
        const galleryGrid = document.createElement('div');
        galleryGrid.className = 'gallery-grid';
        
        galleryImages.forEach(imageSrc => {
            const img = document.createElement('img');
            img.src = imageSrc;
            img.className = 'gallery-image';
            img.alt = 'Project screenshot';
            
            // Hide images that fail to load
            img.onerror = function() {
                this.style.display = 'none';
            };
            
            // Add click handler for full-size view
            img.addEventListener('click', () => this.openImageFullscreen(imageSrc));
            
            galleryGrid.appendChild(img);
        });
        
        this.modalGallery.innerHTML = '';
        this.modalGallery.appendChild(galleryGrid);
    }
    
    openImageFullscreen(imageSrc) {
        const fullscreenModal = document.createElement('div');
        fullscreenModal.className = 'fullscreen-modal';
        fullscreenModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            cursor: pointer;
        `;
        
        const img = document.createElement('img');
        img.src = imageSrc;
        img.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
            border-radius: 8px;
        `;
        
        fullscreenModal.appendChild(img);
        
        fullscreenModal.addEventListener('click', () => {
            document.body.removeChild(fullscreenModal);
        });
        
        document.body.appendChild(fullscreenModal);
    }
    
    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    }
    
    setupModalHandlers() {
        // Close button
        this.closeButton.addEventListener('click', () => this.closeModal());
        
        // Click outside modal to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.closeModal();
            }
        });
    }
}

// Handle image fallbacks for card images
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioShowcase();
    
    // Add global error handler for images
    document.addEventListener('error', (e) => {
        if (e.target.tagName === 'IMG') {
            const img = e.target;
            if (img.src.includes('_card.png')) {
                // Try fallback to main image
                const newSrc = img.src.replace('_card.png', '.png');
                img.src = newSrc;
            } else if (!img.dataset.fallbackAttempted) {
                // Hide image if main fallback also fails
                img.dataset.fallbackAttempted = 'true';
                img.style.display = 'none';
            }
        }
    }, true);
});
