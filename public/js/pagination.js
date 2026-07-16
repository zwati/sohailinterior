/**
 * Pagination - Generate pagination HTML and handle pagination logic
 */

const Pagination = {
    /**
     * Generate pagination HTML
     * @param {number} currentPage - Current page number
     * @param {number} totalPages - Total number of pages
     * @param {string} onClickFunction - Function name to call on page change
     * @param {number} delta - Number of pages to show around current page (default: 1)
     * @returns {string} HTML string for pagination
     */
    generateHTML(currentPage, totalPages, onClickFunction, delta = 1) {
        if (totalPages <= 1) return '';

        let html = `
            <button class="pagination-btn" onclick="${onClickFunction}(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
                Back
            </button>
            <div class="pagination-numbers">
        `;

        // Smart truncation logic
        const range = [];
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 || 
                i === totalPages || 
                (i >= currentPage - delta && i <= currentPage + delta)
            ) {
                range.push(i);
            }
        }

        let l;
        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    html += `<button class="pagination-number" onclick="${onClickFunction}(${l + 1})">${l + 1}</button>`;
                } else if (i - l !== 1) {
                    html += `<span class="pagination-ellipsis">...</span>`;
                }
            }
            html += `
                <button class="pagination-number ${i === currentPage ? 'active' : ''}" onclick="${onClickFunction}(${i})">
                    ${i}
                </button>
            `;
            l = i;
        }

        html += `
            </div>
            <button class="pagination-btn" onclick="${onClickFunction}(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
                Next
            </button>
        `;

        return html;
    },

    /**
     * Paginate an array
     * @param {Array} items - Array to paginate
     * @param {number} page - Current page number (1-based)
     * @param {number} itemsPerPage - Number of items per page
     * @returns {object} Object with paginated items and metadata
     */
    paginate(items, page = 1, itemsPerPage = 10) {
        const totalPages = Math.ceil(items.length / itemsPerPage);
        const currentPage = Math.max(1, Math.min(page, totalPages));
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = items.slice(startIndex, endIndex);

        return {
            items: paginatedItems,
            currentPage,
            totalPages,
            totalItems: items.length,
            hasNextPage: currentPage < totalPages,
            hasPrevPage: currentPage > 1
        };
    }
};

// Export for use in modules or global scope
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Pagination;
} else {
    window.Pagination = Pagination;
}
