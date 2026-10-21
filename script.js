const PROJECT_IMAGE_MAP = {
    "Bajillions Early Math": {
        cover: "images/bajillions_card.png",
        gallery: [
            "images/bajillions_card.png",
            "images/bajillions_gameplay1.png",
            "images/bajillions_gameplay2.png"
        ]
    },
    "PBS Kids Play And Learn Science": {
        cover: "images/play_and_learn_science_card.png",
        gallery: [
            "images/play_and_learn_science.png",
            "images/play_and_learn_science_card.png",
            "images/play_and_learn_science_gameplay.png"
        ]
    },
    "PBS Kids Play And Learn Engineering": {
        cover: "images/play_and_learn_engineering_card.png",
        gallery: [
            "images/play_and_learn_engineering_card.png",
            "images/play_and_learn_engineering_gameplay1.png",
            "images/play_and_learn_engineering_gameplay2.png",
            "images/play_and_learn_engineering_gameplay3.png"
        ]
    },
    "Amira and the Story Craft": {
        cover: "images/amira_and_the_storycraft_card.png",
        gallery: [
            "images/amira_and_the_storycraft.png",
            "images/amira_and_the_storycraft_card.png",
            "images/amira_and_the_storycraft_gameplay.png",
            "images/amira_and_the_storycraft_gameplay1.png",
            "images/amira_and_the_storycraft_gameplay2.png"
        ]
    },
    "Jelly Ben And Pogo: Babysitting Squee": {
        cover: "images/jelly_ben_and_pogo_babysitting_squee_card.png",
        gallery: [
            "images/jelly_ben_and_pogo.png",
            "images/jelly_ben_and_pogo_babysitting_squee_card.png",
            "images/jelly_ben_and_pogo_babysitting_squee_gameplay.png",
            "images/jelly_ben_and_pogo_babysitting_squee_gameplay1.png",
            "images/jelly_ben_and_pogo_babysitting_squee_gameplay2.png",
            "images/jelly_ben_and_pogo_babysitting_squee_gameplay3.png"
        ]
    },
    "Jelly Ben And Pogo: Karaoke Night": {
        cover: "images/jelly_ben_and_pogo_karaoke_night_card.png",
        gallery: [
            "images/jelly_ben_and_pogo.png",
            "images/jelly_ben_and_pogo_karaoke_night_card.png",
            "images/jelly_ben_and_pogo_karaoke_night_gameplay1.png",
            "images/jelly_ben_and_pogo_karaoke_night_gameplay2.png",
            "images/jelly_ben_and_pogo_karaoke_night_gameplay3.png"
        ]
    },
    "Visiting the doctor": {
        cover: "images/visiting_the_doctor_card.png",
        gallery: [
            "images/visiting_the_doctor.png",
            "images/visiting_the_doctor_card.png",
            "images/visiting_the_doctor_gameplay.png"
        ]
    }
};

const KEYWORD_LABELS = {
    pixijs: "PixiJS",
    react: "React",
    phaser: "Phaser",
    unity: "Unity",
    webgl: "WebGL",
    ai: "AI Learning",
    stem: "STEM",
    kids: "Kids Learning"
};

function slugify(value) {
    return value
        .toLowerCase()
        .replace(/[:']/g, "")
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
}

function getProjectMedia(projectName) {
    if (PROJECT_IMAGE_MAP[projectName]) {
        return PROJECT_IMAGE_MAP[projectName];
    }

    const slug = slugify(projectName);
    return {
        cover: `images/${slug}_card.png`,
        gallery: [
            `images/${slug}.png`,
            `images/${slug}_card.png`,
            `images/${slug}_gameplay.png`,
            `images/${slug}_gameplay1.png`,
            `images/${slug}_gameplay2.png`,
            `images/${slug}_gameplay3.png`
        ]
    };
}

function setupMenuToggle() {
    const menuButton = document.getElementById("menu-toggle");
    const nav = document.getElementById("site-nav");

    if (!menuButton || !nav) {
        return;
    }

    menuButton.addEventListener("click", () => {
        const shouldOpen = !nav.classList.contains("is-open");
        nav.classList.toggle("is-open", shouldOpen);
        menuButton.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
    });

    nav.addEventListener("click", () => {
        nav.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
    });
}

function inferProjectMeta(project) {
    const rawKeywords = project?.keywords;
    const keywordList = Array.isArray(rawKeywords)
        ? rawKeywords
        : typeof rawKeywords === "string"
            ? rawKeywords.split(/[,|]/)
            : [];

    const normalizedKeyword = keywordList
        .map((keyword) => String(keyword).trim().toLowerCase())
        .filter(Boolean)
        .find((keyword) => KEYWORD_LABELS[keyword]);

    if (normalizedKeyword) {
        return KEYWORD_LABELS[normalizedKeyword];
    }

    const text = `${project.name} ${project.description}`.toLowerCase();
    const tag = Object.keys(KEYWORD_LABELS).find((keyword) => text.includes(keyword));
    return tag ? KEYWORD_LABELS[tag] : "Interactive Learning";
}

function truncate(text, length = 160) {
    if (!text || text.length <= length) {
        return text;
    }

    return `${text.slice(0, length - 1).trim()}...`;
}

class PortfolioHome {
    constructor() {
        this.projects = [];
        this.filtered = [];

        this.grid = document.getElementById("projects-grid");
        this.search = document.getElementById("project-search");
        this.empty = document.getElementById("projects-empty");

        this.dialog = document.getElementById("project-dialog");
        this.dialogClose = document.getElementById("dialog-close");
        this.dialogTag = document.getElementById("dialog-tag");
        this.dialogTitle = document.getElementById("dialog-title");
        this.dialogDescription = document.getElementById("dialog-description");
        this.dialogGallery = document.getElementById("dialog-gallery");
        this.dialogLink = document.getElementById("dialog-link");
    }

    async init() {
        if (!this.grid) {
            return;
        }

        try {
            const response = await fetch("json/site_data.json");
            this.projects = await response.json();
            this.filtered = [...this.projects];
            this.render();
            this.bindEvents();
        } catch (error) {
            this.grid.innerHTML = "<p class=\"projects-empty\">Unable to load projects right now.</p>";
            console.error(error);
        }
    }

    bindEvents() {
        this.search?.addEventListener("input", (event) => {
            const query = event.target.value.trim().toLowerCase();
            this.filtered = this.projects.filter((project) => {
                const source = `${project.name} ${project.description}`.toLowerCase();
                return source.includes(query);
            });
            this.render();
        });

        this.dialogClose?.addEventListener("click", () => this.closeDialog());
        this.dialog?.addEventListener("click", (event) => {
            if (event.target === this.dialog) {
                this.closeDialog();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && this.dialog?.open) {
                this.closeDialog();
            }
        });
    }

    render() {
        this.grid.innerHTML = "";

        this.filtered.forEach((project) => {
            this.grid.appendChild(this.createProjectCard(project));
        });

        this.empty.hidden = this.filtered.length > 0;
    }

    createProjectCard(project) {
        const article = document.createElement("article");
        article.className = "project-card";
        article.setAttribute("tabindex", "0");

        const media = getProjectMedia(project.name);

        article.innerHTML = `
            <img class="project-cover" src="${media.cover || "images/profile_picture.jpg"}" alt="${project.name} thumbnail" loading="lazy">
            <div class="project-content">
                <h3>${project.name}</h3>
                <p class="project-meta">${inferProjectMeta(project)}</p>
            </div>
        `;

        const cover = article.querySelector(".project-cover");
        if (cover) {
            cover.addEventListener("error", () => {
                cover.src = "images/profile_picture.jpg";
            }, { once: true });
        }

        article.addEventListener("click", () => this.openDialog(project));
        article.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                this.openDialog(project);
            }
        });

        return article;
    }

    openDialog(project) {
        const media = getProjectMedia(project.name);

        this.dialogTag.textContent = inferProjectMeta(project);
        this.dialogTitle.textContent = project.name;
        this.dialogDescription.textContent = project.description;
        this.dialogLink.href = project.website;

        this.dialogGallery.innerHTML = "";
        media.gallery.forEach((src) => {
            const image = document.createElement("img");
            image.src = src;
            image.alt = `${project.name} screenshot`;
            image.loading = "lazy";
            image.addEventListener("error", () => image.remove());
            this.dialogGallery.appendChild(image);
        });

        if (typeof this.dialog.showModal === "function") {
            this.dialog.showModal();
        }
    }

    closeDialog() {
        if (this.dialog?.open) {
            this.dialog.close();
        }
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    setupMenuToggle();

    const page = document.body.dataset.page;
    if (page === "home") {
        const home = new PortfolioHome();
        await home.init();
    }
});
