/**
 * Consistent page header used at the top of every page.
 * @param {{ title: string, description?: string, children?: React.ReactNode }} props
 */
export default function PageHeader({ title, description, children }) {
  return (
    <div className="flex flex-col gap-1 mb-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <h1
          className="text-2xl font-bold m-0 truncate"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}
        >
          {title}
        </h1>
        {description && (
          <p
            className="text-sm m-0 mt-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 shrink-0 mt-3 sm:mt-0">
          {children}
        </div>
      )}
    </div>
  );
}
