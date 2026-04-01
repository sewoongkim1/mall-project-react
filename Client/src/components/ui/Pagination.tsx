import { cn } from '@/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage:  number
  totalPages:   number
  onPageChange: (page: number) => void
  siblings?:    number
  className?:   string
}

function getPageNumbers(current: number, total: number, siblings: number): (number | '...')[] {
  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i)

  const totalNumbers = siblings * 2 + 5 // siblings + boundaries + current + 2 dots
  if (totalNumbers >= total) return range(1, total)

  const leftSibling  = Math.max(current - siblings, 1)
  const rightSibling = Math.min(current + siblings, total)

  const showLeftDots  = leftSibling > 2
  const showRightDots = rightSibling < total - 1

  if (!showLeftDots && showRightDots) {
    const leftCount = 3 + 2 * siblings
    return [...range(1, leftCount), '...', total]
  }

  if (showLeftDots && !showRightDots) {
    const rightCount = 3 + 2 * siblings
    return [1, '...', ...range(total - rightCount + 1, total)]
  }

  return [1, '...', ...range(leftSibling, rightSibling), '...', total]
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblings = 1,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = getPageNumbers(currentPage, totalPages, siblings)

  const btnBase = 'inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm transition-colors'

  return (
    <nav className={cn('flex items-center gap-1', className)} aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(btnBase, 'text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed')}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`dots-${i}`} className="w-9 text-center text-gray-400 text-sm">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              btnBase,
              page === currentPage
                ? 'bg-brand-600 text-white font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            )}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(btnBase, 'text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed')}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  )
}
