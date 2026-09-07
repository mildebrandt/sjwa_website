document.addEventListener('DOMContentLoaded', () => {
    let originalLinksPool = []; // Caches original order layout mapping

    const bannerImages = [
        'images/banners/adam-patterson-v13x0qU4afA-unsplash.jpg',
        // 'images/banners/philip-swinburn-vS7LVkPyXJU-unsplash.jpg',
        'images/banners/yasamine-june-2PMdixMFvvU-unsplash.jpg'
    ];

    // --- 1. Load Universal Header Template ---
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('main-header').innerHTML = data;

            // INJECT RANDOM IMAGE: Pick one image from the list above
            const bannerImgElement = document.getElementById('dynamic-banner-img');
            if (bannerImgElement && bannerImages.length > 0) {
                const randomIndex = Math.floor(Math.random() * bannerImages.length);
                bannerImgElement.src = bannerImages[randomIndex];
            }

            // Highlight active item
            const currentPage = window.location.pathname.split("/").pop();
            document.querySelectorAll('.navigation-menu a').forEach(link => {
                if (link.getAttribute('href') === currentPage || (currentPage === '' && link.getAttribute('href') === 'index.html')) {
                    link.classList.add('active');
                }
            });

            // Mobile Navigation Menu Toggle Action
            const menuToggle = document.querySelector('.menu-toggle');
            const navLinks = document.querySelector('.nav-links');
            if (menuToggle && navLinks) {
                menuToggle.addEventListener('click', () => {
                    menuToggle.classList.toggle('open');
                    navLinks.classList.toggle('active');
                });
            }

            // Cache desktop items list right after template initialization loads
            const primaryList = document.getElementById('primary-nav-list');
            const moreTab = document.getElementById('overflow-more-tab');
            if (primaryList && moreTab) {
                // Collect standard list targets excluding the "More" item container itself
                const items = Array.from(primaryList.children).filter(item => item !== moreTab);
                originalLinksPool = items.map(node => ({ node, width: node.offsetWidth }));

                // Initialize the priority checker framework execution loop
                adjustDesktopOverflow();
                window.addEventListener('resize', adjustDesktopOverflow);
            }
        })
        .catch(error => console.error('Error loading header:', error));

    // --- 2. Load Universal Footer Template & Update Year ---
    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('main-footer').innerHTML = data;
            const yearElement = document.getElementById('copyright-year');
            if (yearElement) {
                yearElement.textContent = new Date().getFullYear();
            }
        })
        .catch(error => console.error('Error loading footer:', error));

    // --- 3. Sticky Navigation Scroll Effect ---
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        const targetNav = document.getElementById('main-nav-bar');
        if (targetNav) {
            if (window.scrollY > 20) {
                targetNav.classList.add('scrolled');
            } else {
                targetNav.classList.remove('scrolled');
            }
        }
    });

    // --- 4. Core Layout Priority Width Allocation Engine ---
    function adjustDesktopOverflow() {
        const primaryList = document.getElementById('primary-nav-list');
        const dropdownList = document.getElementById('overflow-dropdown-list');
        const moreTab = document.getElementById('overflow-more-tab');
        const navContainer = document.querySelector('.nav-container');
        const brand = document.querySelector('.nav-brand-text');

        // Safety check to ensure elements have loaded
        if (!primaryList || !navContainer || originalLinksPool.length === 0) return;

        if (window.innerWidth <= 768) {
            if (moreTab) moreTab.style.display = 'none';
            // Put all links back into the main vertical mobile menu list
            originalLinksPool.forEach(item => primaryList.insertBefore(item.node, moreTab));
            return; 
        }

        // --- DESKTOP VIEW: Calculate space and split links if necessary ---
        moreTab.style.display = 'none';
        originalLinksPool.forEach(item => primaryList.insertBefore(item.node, moreTab));

        let availableWidth = navContainer.offsetWidth - brand.offsetWidth - 40; // padding cushions
        let currentUsedWidth = 0;
        let overflowIndex = -1;

        // Determine at what point links spill past container boundaries
        for (let i = 0; i < originalLinksPool.length; i++) {
            currentUsedWidth += originalLinksPool[i].width + 12; // horizontal space gaps
            if (currentUsedWidth > availableWidth) {
                overflowIndex = i;
                break;
            }
        }

        // If an overflow is found, recalculate with the "More" tab included
        if (overflowIndex !== -1) {
            moreTab.style.display = 'inline-block';
            availableWidth -= moreTab.offsetWidth;

            currentUsedWidth = 0;
            overflowIndex = -1;

            for (let i = 0; i < originalLinksPool.length; i++) {
                currentUsedWidth += originalLinksPool[i].width + 12;
                if (currentUsedWidth > availableWidth) {
                    overflowIndex = i;
                    break;
                }
            }

            // Move the extra items into the desktop sub-dropdown box
            if (overflowIndex !== -1) {
                for (let i = overflowIndex; i < originalLinksPool.length; i++) {
                    dropdownList.appendChild(originalLinksPool[i].node);
                }
            } else {
                moreTab.style.display = 'none';
            }
        }
    }
});
