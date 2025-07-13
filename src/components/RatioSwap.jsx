import React, { useState } from "react";
import { PencilIcon } from "@heroicons/react/24/solid";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
    Card,
    CardHeader,
    Typography,
    Button,
    CardBody,
    Chip,
    CardFooter,
    Avatar,
    IconButton,
    Tooltip,
    Input,
} from "@material-tailwind/react";
import { Spinner } from "@material-tailwind/react";

const RatioSwap = ({ TABLE_NAME, TABLE_SUBNAME, TABLE_HEAD, TABLE_ROWS, handleUpdate, isLoading, latestUpdate }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

    // Filter rows based on search term
    const filteredRows = TABLE_ROWS.filter((row) =>
        row.tokenNameSource.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Total pages
    const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

    // Sliced rows for the current page
    const currentRows = filteredRows.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    // Next page handler
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Previous page handler
    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const formatDate = (dateString) => {
        // Create a new Date object
        const date = new Date(dateString);

        // Format the time
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");

        // Format the date
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
        const year = date.getFullYear();

        const formattedDate = `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;

        return formattedDate;
    };

    const formatNumber = (numberString) => {
        // Format the number with commas
        const formattedNumber = new Intl.NumberFormat('en-US').format(numberString);

        return formattedNumber;
    };

    const formatCrypto = (numberString) => {
        // Parse input as a float
        const number = parseFloat(numberString);

        if (isNaN(number)) return "Invalid number"; // Xử lý trường hợp không phải số

        // Format the number with commas and 10 decimal places
        const formattedNumber = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 10,
            maximumFractionDigits: 10,
        }).format(number);

        return formattedNumber;
    };

    return (
        <Card className="h-full w-full min-h-[23rem] flex flex-col">
            <CardBody className="flex-1 overflow-x-auto px-0 relative">
                {isLoading && (
                    <div className="absolute inset-0 flex justify-center items-center bg-white/50 z-10">
                        <Spinner />
                    </div>
                )}
                {!isLoading && (<table className="w-[100%] mx-auto min-w-max table-auto text-center">
                    <thead>
                        <tr>
                            {TABLE_HEAD.map((head, index) => (
                                <th
                                    key={head}
                                    className={`${index === 0
                                        ? "text-left"
                                        : index === TABLE_HEAD.length - 1
                                            ? "text-right"
                                            : "text-right"
                                        } border-y border-blue-gray-100 bg-blue-gray-50/50 p-4`}

                                >
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className={`font-normal leading-none opacity-70
                                            `}
                                    >
                                        {head}
                                    </Typography>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody
                        className={`min-h-[20rem] ${isLoading ? "min-h-[20rem] flex items-center justify-center" : ""
                            }`}
                    >
                        {currentRows.map(
                            (
                                {
                                    tokenNameSource,
                                    tokenNameDestination,
                                    ratio,
                                    balance
                                },
                                index
                            ) => {
                                const isLast = index === currentRows.length - 1;
                                const classes = isLast
                                    ? "p-4 border-b border-blue-gray-50"
                                    : "p-4 border-b border-blue-gray-50";

                                return (
                                    <tr key={index || `${latestUpdate}-${index}`}>
                                        <td className="text-left p-4 border-b border-blue-gray-50">
                                            <Typography
                                                variant="small"
                                                color="blue-gray"
                                                className="font-normal"
                                            >
                                                {balance}
                                            </Typography>
                                        </td>

                                        <td className={`text-right p-4 border-b border-blue-gray-50`}>
                                            <Typography
                                                variant="small"
                                                color="blue-gray"
                                                className="font-normal"
                                            >
                                                1 {tokenNameSource} ~ {formatCrypto(ratio)}{" "}
                                                {tokenNameDestination}
                                            </Typography>
                                        </td>

                                        {/* <td className={classes}>
                                            
                                        </td> */}
                                    </tr>
                                );
                            }
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={3} className="p-4">
                                <div className="flex items-center justify-center">
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className={`font-bold ${isLoading ? "cursor-progress" : "cursor-pointer"}`}
                                        onClick={
                                            !isLoading
                                                ? () => handleUpdate(600)
                                                : undefined
                                        }
                                    >
                                        Time updated {formatDate(latestUpdate)}
                                    </Typography>
                                </div>
                            </td>
                        </tr>
                    </tfoot>
                </table>)}
            </CardBody>
        </Card>
    );

};

export default RatioSwap;
