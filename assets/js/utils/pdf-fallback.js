/**
 * PDF Fallback Utility
 * Handles PDF embedding and provides fallback options
 */

import { canEmbedPDF } from './detect.js';

/**
 * Initialize PDF fallback mechanism
 */
export function initPDFFallback(pdfFrame, fallbackElement, options = {}) {
    if (!pdfFrame || !fallbackElement) return;
    
    const { downloadLink, newWindowLink, pdfUrl } = options;
    
    // Check if browser can embed PDF
    if (!canEmbedPDF()) {
        showFallback();
        return;
    }
    
    // Set up error handling for iframe
    pdfFrame.addEventListener('load', () => {
        // Check if PDF loaded successfully
        try {
            const iframeDoc = pdfFrame.contentDocument || pdfFrame.contentWindow.document;
            
            // If we can access the document and it's not a PDF viewer, show fallback
            if (iframeDoc && iframeDoc.body && !iframeDoc.body.innerHTML.includes('embed')) {
                // Some browsers show an error page instead of PDF
                const hasError = iframeDoc.body.textContent.toLowerCase().includes('error') ||
                               iframeDoc.body.textContent.toLowerCase().includes('cannot') ||
                               iframeDoc.body.innerHTML.includes('404');
                
                if (hasError) {
                    showFallback();
                }
            }
        } catch (e) {
            // Cross-origin or other access issues
            // PDF might still be loading fine, so we don't show fallback here
            console.log('PDF iframe access restricted (expected for cross-origin PDFs)');
        }
    });
    
    // Set up error event
    pdfFrame.addEventListener('error', () => {
        showFallback();
    });
    
    // Function to show fallback UI
    function showFallback() {
        // Hide PDF iframe
        pdfFrame.style.display = 'none';
        
        // Show fallback element
        fallbackElement.classList.remove('hidden');
        
        // Set up download link (optional)
        if (downloadLink && pdfUrl) {
            downloadLink.href = pdfUrl;
            downloadLink.download = pdfUrl.split('/').pop();
        }
        
        // Set up new window link (always available)
        if (newWindowLink && pdfUrl) {
            newWindowLink.href = pdfUrl;
            newWindowLink.target = '_blank';
            newWindowLink.rel = 'noopener noreferrer';
        }
    }
    
    // Test PDF loading after a timeout
    setTimeout(() => {
        checkPDFLoad(pdfFrame, fallbackElement, pdfUrl);
    }, 3000);
}

/**
 * Check if PDF loaded successfully
 */
function checkPDFLoad(pdfFrame, fallbackElement, pdfUrl) {
    // If iframe src is empty or different from expected, show fallback
    if (!pdfFrame.src || pdfFrame.src === 'about:blank' || pdfFrame.src === '') {
        // PDF failed to load
        pdfFrame.style.display = 'none';
        fallbackElement.classList.remove('hidden');
    }
}

/**
 * Create a PDF viewer using PDF.js (optional enhanced viewer)
 */
export function createPDFViewer(container, pdfUrl, options = {}) {
    const {
        width = '100%',
        height = '600px',
        showToolbar = true,
        showPageNav = true
    } = options;
    
    // Create viewer structure
    const viewer = document.createElement('div');
    viewer.className = 'pdf-viewer';
    viewer.style.width = width;
    viewer.style.height = height;
    
    // If PDF.js is available, use it
    if (window.pdfjsLib) {
        initPDFJS(viewer, pdfUrl, options);
    } else {
        // Fallback to iframe
        const iframe = document.createElement('iframe');
        iframe.src = pdfUrl;
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.frameBorder = '0';
        iframe.title = 'PDF Viewer';
        viewer.appendChild(iframe);
    }
    
    container.appendChild(viewer);
    
    return viewer;
}

/**
 * Initialize PDF.js viewer (if library is loaded)
 */
async function initPDFJS(container, pdfUrl, options) {
    try {
        // Set worker source
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/js/vendor/pdfjs/pdf.worker.min.js';
        
        // Load PDF document
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        
        // Create canvas for rendering
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Create page navigation
        if (options.showPageNav) {
            const nav = createPageNavigation(pdf, canvas, context);
            container.appendChild(nav);
        }
        
        // Render first page
        renderPage(pdf, 1, canvas, context);
        
        container.appendChild(canvas);
        
    } catch (error) {
        console.error('Error loading PDF with PDF.js:', error);
        // Fallback to simple iframe
        const iframe = document.createElement('iframe');
        iframe.src = pdfUrl;
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.frameBorder = '0';
        container.appendChild(iframe);
    }
}

/**
 * Create page navigation for PDF.js viewer
 */
function createPageNavigation(pdf, canvas, context) {
    const nav = document.createElement('div');
    nav.className = 'pdf-nav';
    
    let currentPage = 1;
    const numPages = pdf.numPages;
    
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '上一頁';
    prevBtn.className = 'btn btn--small';
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderPage(pdf, currentPage, canvas, context);
            updatePageInfo();
        }
    };
    
    const nextBtn = document.createElement('button');
    nextBtn.textContent = '下一頁';
    nextBtn.className = 'btn btn--small';
    nextBtn.onclick = () => {
        if (currentPage < numPages) {
            currentPage++;
            renderPage(pdf, currentPage, canvas, context);
            updatePageInfo();
        }
    };
    
    const pageInfo = document.createElement('span');
    pageInfo.className = 'pdf-page-info';
    
    function updatePageInfo() {
        pageInfo.textContent = `第 ${currentPage} / ${numPages} 頁`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === numPages;
    }
    
    updatePageInfo();
    
    nav.appendChild(prevBtn);
    nav.appendChild(pageInfo);
    nav.appendChild(nextBtn);
    
    return nav;
}

/**
 * Render a PDF page using PDF.js
 */
async function renderPage(pdf, pageNumber, canvas, context) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.5 });
    
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    const renderContext = {
        canvasContext: context,
        viewport: viewport
    };
    
    await page.render(renderContext).promise;
}

/**
 * Simple PDF download function
 */
export function downloadPDF(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || url.split('/').pop() || 'document.pdf';
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Open PDF in new window/tab
 */
export function openPDFInNewWindow(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
}
