import { useState, useMemo, useEffect } from 'react';

export function usePagination<T>(items: T[], pageSize: number = 12) {
    const [currentPage, setCurrentPage] = useState(1);

    // Reset to page 1 when items change — use startTransition to avoid synchronous setState warning
     
    useEffect(() => { queueMicrotask(() => setCurrentPage(1)); }, [items.length]);

    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return items.slice(start, start + pageSize);
    }, [items, currentPage, pageSize]);

    return {
        paginatedItems,
        currentPage,
        totalPages,
        total: items.length,
        setPage: (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages))),
        nextPage: () => setCurrentPage((p) => Math.min(p + 1, totalPages)),
        prevPage: () => setCurrentPage((p) => Math.max(p - 1, 1)),
    };
}
