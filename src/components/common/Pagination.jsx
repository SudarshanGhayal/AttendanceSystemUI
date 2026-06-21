export default function Pagination({ pageNumber, pageSize, totalCount, totalPages, onPageChange }) {
  if (totalCount === 0) return null;
  const start = (pageNumber - 1) * pageSize + 1;
  const end = Math.min(pageNumber * pageSize, totalCount);

  return (
    <div className="pagination">
      <span>Showing {start}–{end} of {totalCount}</span>
      <div className="pagination-controls">
        <button
          className="btn btn-outline btn-sm"
          onClick={() => onPageChange(pageNumber - 1)}
          disabled={pageNumber <= 1}
        >
          ← Prev
        </button>
        <span>Page {pageNumber} of {Math.max(totalPages, 1)}</span>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={pageNumber >= totalPages}
        >
          Next →
        </button>
      </div>
    </div>
  );
}