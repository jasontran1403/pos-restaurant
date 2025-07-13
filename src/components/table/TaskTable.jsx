import { useState } from "react";
import { Box, Button, ButtonGroup, Icon, Text } from "@chakra-ui/react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Filters from "./Filters";
import SortIcon from "./icons/SortIcon";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "../../theme/theme";

const TaskTable = ({ columns, data }) => {
  const [columnFilters, setColumnFilters] = useState([]);

  

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onChange",
    meta: {
      updateData: (rowIndex, columnId, value) =>
        setData((prev) =>
          prev.map((row, index) =>
            index === rowIndex
              ? {
                  ...prev[rowIndex],
                  [columnId]: value,
                }
              : row
          )
        ),
    },
  });

  return (
    <ChakraProvider theme={theme}>
      <Box>
        <Filters
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
        />
        <Box className="table" w={table.getTotalSize()}>
          {table.getHeaderGroups().map((headerGroup) => (
            <Box className="tr" key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Box className="th" w={header.getSize()} key={header.id}>
                  {header.column.columnDef.header}
                  {header.column.getCanSort() && (
                    <Icon
                      as={SortIcon}
                      mx={3}
                      fontSize={14}
                      onClick={header.column.getToggleSortingHandler()}
                    />
                  )}
                  {
                    {
                      asc: " 🔼",
                      desc: " 🔽",
                    }[header.column.getIsSorted()]
                  }
                  <Box
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                  />
                </Box>
              ))}
            </Box>
          ))}
          {table.getRowModel().rows.map((row) => (
            <Box className="tr" key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <Box className="td" w={cell.column.getSize()} key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
        <br />
        <Box className="btn-pagination">
          <Text mb={2}>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </Text>
          <ButtonGroup size="sm" isAttached variant="outline">
            <Button
              onClick={() => table.previousPage()}
              isDisabled={!table.getCanPreviousPage()}
            >
              {"<"}
            </Button>
            <Button
              onClick={() => table.nextPage()}
              isDisabled={!table.getCanNextPage()}
            >
              {">"}
            </Button>
          </ButtonGroup>
        </Box>
      </Box>
    </ChakraProvider>
  );
};
export default TaskTable;
