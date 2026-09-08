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
            document.querySelectorAll('.nav-links a').forEach(link => {
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

    // --- 6. Interactive Gallery Lightbox Engine ---
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-target-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.querySelector('.lightbox-close-btn');

    // Attach click events to all image wrappers inside the gallery container
    document.body.addEventListener('click', (event) => {
        // Check if the clicked element is an image inside a gallery card
        const clickedImg = event.target.closest('.gallery-img');

        if (clickedImg && lightbox && lightboxImg) {
            lightbox.style.display = 'flex';
            // Force browser layout pass before adding transition classes
            setTimeout(() => lightbox.classList.add('active'), 10);

            // Swap the placeholder link with the full clicked picture source path
            lightboxImg.src = clickedImg.src;

            // Pull the heading from the card content to use as a description caption
            const card = clickedImg.closest('.gallery-card');
            const heading = card ? card.querySelector('h3') : null;
            if (lightboxCaption) {
                lightboxCaption.textContent = heading ? heading.textContent : "";
            }
        }
    });

    // Close the pop-up when clicking the (X) button
    if (closeBtn && lightbox) {
        closeBtn.addEventListener('click', closeLightbox);
    }

    // Close the pop-up automatically if the user clicks anywhere on the dark background
    if (lightbox) {
        lightbox.addEventListener('click', (event) => {
            if (event.target === lightbox) {
                closeLightbox();
            }
        });
    }

    window.addEventListener('keydown', (event) => {
        // Check if the lightbox is currently open and active
        if (lightbox && lightbox.style.display === 'flex' && event.key === 'Escape') {
            closeLightbox();
        }
    });

    function closeLightbox() {
        if (lightbox) {
            lightbox.classList.remove('active');
            // Wait for scale fade animation to complete before removing block display
            setTimeout(() => {
                lightbox.style.display = 'none';
            }, 300);
        }
    }
    // --- 9. Secure External CSV Decryption & Table Matrix Generation Engine ---
    const csvForm = document.getElementById('csv-decrypt-form');
    const csvPass = document.getElementById('csv-passcode');
    const csvGate = document.getElementById('csv-gate-box');
    const csvTarget = document.getElementById('decrypted-table-section');
    const csvError = document.getElementById('csv-error-text');

    if (csvForm && csvTarget) {
        csvForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const passwordAttempt = csvPass.value;

            fetch('encrypted_roster.txt')
                .then(response => {
                    if (!response.ok) throw new Error("Could not load secure data file.");
                    return response.text();
                })
                .then(encryptedData => {
                    const bytes = CryptoJS.AES.decrypt(encryptedData.trim(), passwordAttempt);
                    const decryptedCSVString = bytes.toString(CryptoJS.enc.Utf8);

                    if (decryptedCSVString && decryptedCSVString.length > 0) {
                        const parsedData = Papa.parse(decryptedCSVString, { skipEmptyLines: true }).data;

                        if (parsedData.length > 0) {
                            // Render the initial unsorted table matrix framework
                            renderTable(parsedData);

                            // Reveal the hidden success text banner element
                            const successTextElement = document.getElementById('vault-success-text');
                            if (successTextElement) successTextElement.style.display = 'block';

                            // Reveal the control action buttons container along with the table
                            const actionControls = document.getElementById('vault-action-controls');
                            if (actionControls) actionControls.style.display = 'flex';

                            csvTarget.style.display = 'block';
                            csvGate.style.display = 'none';
                            if (csvError) csvError.style.display = 'none';
                            // Initialize the data exporter hooks right away
                            initializeExportEngine(parsedData);
                            initializeSearchEngine();
                        }
                    } else {
                        throw new Error("Invalid cryptographic passcode match.");
                    }
                })
                .catch(error => {
                    console.error(error);
                    if (csvError) csvError.style.display = 'block';
                    csvPass.value = '';
                    csvPass.focus();
                });
        });
    }

    // Helper Function A: Renders the table array and attaches click listeners
    function renderTable(dataRows) {
        const targetContainer = document.getElementById('decrypted-table-section');
        if (!targetContainer || dataRows.length === 0) return;

        let tableHTML = '<table class="vault-data-table" id="interactive-data-table"><thead><tr>';

        // Build out the standard top row headers array
        dataRows[0].forEach((headerText, index) => {
            tableHTML += `<th data-column-index="${index}" data-sort-order="desc">${headerText} <span>↕</span></th>`;
        });
        tableHTML += '</tr></thead><tbody>';

        // Build out the internal content cells data grid matrix lines
        for (let i = 1; i < dataRows.length; i++) {
            tableHTML += '<tr>';
            dataRows[i].forEach(cellText => {
                tableHTML += `<td>${cellText}</td>`;
            });
            tableHTML += '</tr>';
        }
        tableHTML += '</tbody></table>';
        targetContainer.innerHTML = tableHTML;

        // Attach interactive sort trigger hooks to headers elements directly
        const headers = targetContainer.querySelectorAll('th');
        headers.forEach(th => {
            th.addEventListener('click', () => {
                const columnIndex = parseInt(th.getAttribute('data-column-index'));
                const currentOrder = th.getAttribute('data-sort-order');
                const nextOrder = currentOrder === 'asc' ? 'desc' : 'asc';

                // Fire off the inline table sorter algorithm execution engine
                sortTable(columnIndex, nextOrder);

                // Update sorting state arrow attributes
                headers.forEach(h => {
                    h.setAttribute('data-sort-order', 'desc');
                    h.querySelector('span').textContent = '↕';
                });
                th.setAttribute('data-sort-order', nextOrder);
                th.querySelector('span').textContent = nextOrder === 'asc' ? '▴' : '▾';
            });
        });
    }

    // Helper Function B: Intelligent client-side text/numeric string sorter loop array
    function sortTable(colIndex, direction) {
        const table = document.getElementById('interactive-data-table');
        if (!table) return;
        const tbody = table.tBodies[0];
        const rowsArray = Array.from(tbody.rows);

        rowsArray.sort((rowA, rowB) => {
            const cellA = rowA.cells[colIndex].textContent.trim();
            const cellB = rowB.cells[colIndex].textContent.trim();

            // Intelligently parse numerical lines vs text formats for accurate alignment
            const numA = parseFloat(cellA.replace(/[^0-9.-]+/g, ""));
            const numB = parseFloat(cellB.replace(/[^0-9.-]+/g, ""));

            if (!isNaN(numA) && !isNaN(numB)) {
                return direction === 'asc' ? numA - numB : numB - numA;
            }

            // Fallback default dictionary text string comparisons rules mapping matches
            return direction === 'asc' 
                ? cellA.localeCompare(cellB, undefined, { numeric: true, sensitivity: 'base' })
                : cellB.localeCompare(cellA, undefined, { numeric: true, sensitivity: 'base' });
        });

        // Re-append rows array entries cleanly directly straight back to update browser layouts trees
        rowsArray.forEach(row => tbody.appendChild(row));
    }

    // --- 10. Dynamic Data Export Processing Engine ---
    function initializeExportEngine(rawArrayMatrix) {
        const csvDownloadBtn = document.getElementById('export-csv-btn');
        const pdfDownloadBtn = document.getElementById('export-pdf-btn');

        if (!csvDownloadBtn || !pdfDownloadBtn || rawArrayMatrix.length === 0) return;

        // A. SYSTEM LOGIC: Process and generate raw CSV download files blocks
        csvDownloadBtn.onclick = () => {
            // Re-convert arrays data matrix blocks straight back into standard csv rows comma strings
            const csvContent = rawArrayMatrix.map(row => 
                row.map(value => `"${value.replace(/"/g, '""')}"`).join(",")
            ).join("\n");

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);

            link.setAttribute("href", url);
            link.setAttribute("download", "sjwa_roster.csv");
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        // B. SYSTEM LOGIC: Sandbox frame routine for isolated clean document printing (PDF)
        pdfDownloadBtn.onclick = () => {
            const tableContent = document.getElementById('decrypted-table-section').innerHTML;

            // Create an isolated, temporary browser frame window to isolate printing targets
            const printWindow = window.open('', '', 'height=700,width=900');

            printWindow.document.write('<html><head><title>SJWA Roster</title>');
            // Inject standard printing styling parameters directly into the window canvas tree
            printWindow.document.write('<style>');
            printWindow.document.write('body { font-family: sans-serif; padding: 30px; color: #333; }');
            printWindow.document.write('h2 { text-align: center; margin-bottom: 20px; }');
            printWindow.document.write('table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }');
            printWindow.document.write('th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }');
            printWindow.document.write('th { background-color: #f4f4f4; font-weight: bold; }');
            printWindow.document.write('tr:nth-child(even) { background-color: #fafafa; }');
            printWindow.document.write('span { display: none; } /* Completely hides interactive sorter arrow toggles from prints */');
            printWindow.document.write('</style></head><body>');

            printWindow.document.write('<h2>SJWA Roster</h2>');
            printWindow.document.write(tableContent); // Drops layout elements copy block in
            printWindow.document.write('</body></html>');

            printWindow.document.close();
            printWindow.focus();

            // Fires up native browser printing windows overlay channels immediately (Allows instant Save As PDF)
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        };
    }
    // --- 11. Live Table Text Filter Search Engine ---
    function initializeSearchEngine() {
        const searchInput = document.getElementById('table-search-input');

        if (!searchInput) return;

        // Wipe any left-over input text if the page re-renders layouts
        searchInput.value = '';

        searchInput.addEventListener('input', () => {
            const filterValue = searchInput.value.toLowerCase();
            const table = document.getElementById('interactive-data-table');

            if (!table) return;

            const rows = table.getElementsByTagName('tbody')[0].rows;

            // Loop through all data rows in the table body rows list
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                let matchFound = false;

                // Check cells inside the active row to see if text characters string matches
                for (let j = 0; j < row.cells.length; j++) {
                    const cellText = row.cells[j].textContent.toLowerCase();
                    if (cellText.indexOf(filterValue) > -1) {
                        matchFound = true;
                        break; // Stop scanning additional cells in this row if a match pops up
                    }
                }

                // Smoothly toggle the row display off or on based on search matrix matches
                if (matchFound) {
                    row.style.display = "";
                } else {
                    row.style.display = "none"; /* Hides the row completely from layout trees view */
                }
            }
        });
    }
});
