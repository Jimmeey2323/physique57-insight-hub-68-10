import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Column {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  sortable?: boolean;
  width?: string;
}

interface UniformTrainerTableProps {
  data: any[];
  columns: Column[];
  loading?: boolean;
  stickyHeader?: boolean;
  showFooter?: boolean;
  footerData?: any;
  maxHeight?: string;
  className?: string;
  headerGradient?: string;
  onSort?: (field: string) => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onRowClick?: (row: any) => void;
}

export const UniformTrainerTable: React.FC<UniformTrainerTableProps> = ({
  data,
  columns,
  loading = false,
  stickyHeader = false,
  showFooter = false,
  footerData,
  maxHeight = "600px",
  className,
  headerGradient = "from-slate-600 to-slate-700",
  onSort,
  sortField,
  sortDirection,
  onRowClick
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleSort = (column: Column) => {
    if (column.sortable && onSort) {
      onSort(column.key);
    }
  };

  return (
    <div className={cn("relative overflow-auto border border-border rounded-lg bg-background", className)} style={{ maxHeight }}>
      <Table className="w-full table-fixed">
        <TableHeader className={cn(
          stickyHeader && "sticky top-0 z-20"
        )}>
          <TableRow className={cn(
            "bg-gradient-to-r text-white border-none",
            headerGradient
          )} style={{ height: '40px' }}>
            {columns.map((column) => (
              <TableHead 
                key={column.key} 
                className={cn(
                  "font-semibold text-white px-3 text-sm whitespace-nowrap",
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right',
                  column.sortable && 'cursor-pointer hover:bg-white/10',
                  column.className
                )}
                style={{ 
                  height: '40px',
                  width: column.width || 'auto'
                }}
                onClick={() => handleSort(column)}
              >
                <div className="flex items-center gap-1 h-full">
                  {column.header}
                  {column.sortable && sortField === column.key && (
                    sortDirection === 'asc' ? 
                      <ChevronUp className="w-3 h-3" /> : 
                      <ChevronDown className="w-3 h-3" />
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow 
              key={index} 
              className={cn(
                "hover:bg-muted/50 transition-colors border-b border-border",
                onRowClick && "cursor-pointer",
                index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
              )}
              style={{ height: '30px' }}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <TableCell 
                  key={column.key}
                  className={cn(
                    "px-3 py-0 text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis",
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.className
                  )}
                  style={{ 
                    height: '30px',
                    lineHeight: '30px'
                  }}
                >
                  <div className="flex items-center h-full overflow-hidden">
                    {column.render 
                      ? column.render(row[column.key], row)
                      : <span className="truncate text-sm">{row[column.key]}</span>
                    }
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        {showFooter && footerData && (
          <TableFooter className="sticky bottom-0 z-10 bg-slate-900 border-t-2 border-slate-700">
            <TableRow className="hover:bg-slate-800 border-none" style={{ height: '35px' }}>
              {columns.map((column) => (
                <TableCell 
                  key={column.key}
                  className={cn(
                    "font-bold text-white px-3 py-0 text-sm whitespace-nowrap",
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.className
                  )}
                  style={{ 
                    height: '35px',
                    lineHeight: '35px'
                  }}
                >
                  <div className="flex items-center h-full overflow-hidden">
                    {column.render 
                      ? column.render(footerData[column.key], footerData)
                      : <span className="truncate text-sm">{footerData[column.key]}</span>
                    }
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
};