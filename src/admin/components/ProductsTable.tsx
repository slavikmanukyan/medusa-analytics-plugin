import * as React from 'react';
import {
  createDataTableColumnHelper,
  useDataTable,
  DataTable,
  DataTablePaginationState,
  DataTableSortingState,
} from '@medusajs/ui';

import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

type ProductsTableProps = {
  products: {
    sku: string;
    variantName: string;
    inventoryQuantity: number;
    variantId: string;
    productId: string;
  }[];
};

const columnHelper =
  createDataTableColumnHelper<ProductsTableProps['products'][0]>();

const columns = [
  columnHelper.accessor('sku', {
    header: 'SKU',
    enableSorting: true,
    sortLabel: 'SKU',
    sortAscLabel: 'A-Z',
    sortDescLabel: 'Z-A',
  }),
  columnHelper.accessor('variantName', {
    header: 'Товар и размер',
    enableSorting: true,
    sortLabel: 'Товар и размер',
    sortAscLabel: 'A-Z',
    sortDescLabel: 'Z-A',
  }),
  columnHelper.accessor('inventoryQuantity', {
    header: 'Доступно',
    enableSorting: true,
    sortLabel: 'Доступно',
    sortAscLabel: 'По возрастанию',
    sortDescLabel: 'По убыванию',
    cell: ({ getValue }) => {
      const value = getValue();

      return (
        <p className={cn(value === 0 && 'text-ui-fg-error')}>
          {value === 0 ? 'Нет в наличии' : value}
        </p>
      );
    },
  }),
];

const PAGE_SIZE = 10;

export const ProductsTable: React.FC<ProductsTableProps> = ({ products }) => {
  const [pagination, setPagination] = React.useState<DataTablePaginationState>({
    pageSize: PAGE_SIZE,
    pageIndex: 0,
  });

  const [search, setSearch] = React.useState<string>('');

  const [sorting, setSorting] = React.useState<DataTableSortingState | null>(
    null,
  );

  const navigate = useNavigate();

  const shownProducts = React.useMemo(() => {
    let filtered = products.filter(
      (product) =>
        product.variantName.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase()),
    );

    if (sorting && sorting.id) {
      filtered = filtered.slice().sort((a, b) => {
        // @ts-expect-error - TypeScript does not know the type of sorting.id
        const aVal = a[sorting.id];
        // @ts-expect-error - TypeScript does not know the type of sorting.id
        const bVal = b[sorting.id];
        if (aVal < bVal) {
          return sorting.desc ? 1 : -1;
        }
        if (aVal > bVal) {
          return sorting.desc ? -1 : 1;
        }
        return 0;
      });
    }

    return filtered.slice(
      pagination.pageIndex * pagination.pageSize,
      (pagination.pageIndex + 1) * pagination.pageSize,
    );
  }, [products, search, sorting, pagination]);

  const table = useDataTable({
    columns,
    data: shownProducts,
    getRowId: (product) => product.variantId,
    rowCount: products.filter(
      (product) =>
        product.variantName.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase()),
    ).length,
    search: {
      state: search,
      onSearchChange: (value) => {
        setSearch(value);
        setPagination((previous) => ({ ...previous, pageIndex: 0 }));
      },
    },
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    sorting: {
      state: sorting,
      onSortingChange: setSorting,
    },
    onRowClick: (_, row) => {
      navigate(
        // @ts-expect-error - original missing in the row type
        `/products/${row.original.productId}/variants/${row.original.variantId}`,
      );
    },
  });

  return (
    <DataTable instance={table}>
      <DataTable.Toolbar className="px-0 pt-0">
        <DataTable.Search placeholder="Поиск…" />
      </DataTable.Toolbar>
      <DataTable.Table
        emptyState={{
          filtered: {
            heading: 'Товары не найдены',
          },
          empty: {
            heading: 'Товаров пока нет',
          },
        }}
      />
      {products.length > PAGE_SIZE && <DataTable.Pagination />}
    </DataTable>
  );
};
