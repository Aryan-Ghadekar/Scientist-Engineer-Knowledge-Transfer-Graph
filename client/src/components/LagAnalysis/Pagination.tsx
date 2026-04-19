import React from "react";

interface Props {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<Props> = ({
    currentPage,
    totalPages,
    onPageChange,
}) => {
    if (totalPages <= 1) return null;

    const getPages = () => {
        const pages = [];
        const maxVisible = 5;

        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;
    };

    return (
        <div className="px-8 py-4 flex justify-between items-center">
            <p className="text-xs text-on-surface-variant">
                Page {currentPage} of {totalPages}
            </p>

            <div className="flex items-center gap-2">
                {/* Prev */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-xs border border-white/10 rounded-md disabled:opacity-30 hover:bg-white/5"
                >
                    Prev
                </button>

                {/* Page Numbers */}
                {getPages().map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`px-3 py-1 text-xs rounded-md transition ${currentPage === page
                                ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30"
                                : "border border-white/10 hover:bg-white/5"
                            }`}
                    >
                        {page}
                    </button>
                ))}

                {/* Next */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-xs border border-white/10 rounded-md disabled:opacity-30 hover:bg-white/5"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Pagination;