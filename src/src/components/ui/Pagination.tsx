import React from 'react';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    let l;
    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  return (
    <nav className="flex items-center justify-center space-x-2 mt-2" aria-label="Pagination">
      <Button
        className={`text-orange-500 ${currentPage === 1 ? 'text-gray-600 p-2' : ''}`}
        size="icon"
        disabled={currentPage === 1}
        aria-label="Go to previous page"
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {getPageNumbers().map((page, index) => (
        page === '...' ? (
          <span key={index} className="px-2 text-gray-500">...</span>
        ) : (
          <Button
              key={index}
              className={`bg-gray-100 p-2 text-gray-500 ${currentPage === page ? 'bg-orange-500 text-bold p-2' : ''}`}
            size="icon"
            aria-label={`Go to page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
            onClick={() => typeof page === 'number' && onPageChange(page)}
          >
            {page}
          </Button>
        )
      ))}
      <Button
        className={`text-orange-500 ${currentPage === totalPages ? 'text-gray-600 p-2' : '' }`}
        size="icon"
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
};

export default Pagination;
