import React, { useState } from "react";
import Axios from "axios";
import { PencilIcon } from "@heroicons/react/24/solid";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";
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
import { API_ENDPOINT } from "../constants";

const DepositTable = ({
  TABLE_NAME,
  TABLE_SUBNAME,
  TABLE_HEAD,
  TABLE_ROWS,
}) => {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("access_token")
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Filter rows based on search term
  const filteredRows = TABLE_ROWS.filter((row) =>
    row.code.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleCancelPending = (depositCode) => {
    if (
      depositCode === undefined ||
      depositCode === null ||
      depositCode === ""
    ) {
      return;
    }

    Swal.fire({
      title: "Confirm cancel deposit",
      text: `Are you sure you want to cancel?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, transfer it!",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
      customClass: {
        confirmButton: "custom-confirm-button", // Custom class for confirm button
        cancelButton: "custom-cancel-button", // Custom class for cancel button
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        let config = {
          method: "get",
          url: `${API_ENDPOINT}management/cancel/${depositCode}`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "ngrok-skip-browser-warning": "69420",
          },
        };

        Axios.request(config)
          .then((response) => {
            if (response.data === "ok") {
              toast.success("Cancel deposit success!", {
                position: "top-right",
                autoClose: 1500,
                onClose: () => window.location.reload(),
              });
            } else {
              toast.error(response.data, {
                position: "top-right",
                autoClose: 1500,
              });
            }
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
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
    const formattedNumber = new Intl.NumberFormat("en-US").format(numberString);

    return formattedNumber;
  };

  return (
    <Card className="h-full w-full flex flex-col">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div>
            <Typography variant="h5" color="blue-gray">
              {TABLE_NAME}
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              {TABLE_SUBNAME}
            </Typography>
          </div>
          <div className="flex w-full shrink-0 gap-2 mr-3 md:w-max">
            <div className="w-full md:w-72 relative">
              <Input
                placeholder="Search by code"
                className="pl-4 pr-10 rounded"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to page 1 on search
                }}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardBody className="flex-1 overflow-x-auto px-0">
        <table className="w-full min-w-max table-auto text-left">
          <thead>
            <tr>
              {TABLE_HEAD.map((head) => (
                <th
                  key={head}
                  className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                >
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="min-h-[20rem]">
            {currentRows.map(
              ({ code, amount, currency, date, status, hash, fee }, index) => {
                const isLast = index === currentRows.length - 1;
                const classes = isLast
                  ? "p-4"
                  : "p-4 border-b border-blue-gray-50";

                return (
                  <tr key={code}>
                    <td className={classes}>
                      <div className="flex items-center gap-3">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-bold"
                        >
                          {code}
                        </Typography>
                      </div>
                    </td>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        <h1>{formatDate(date)}</h1>
                      </Typography>
                    </td>

                    <td className={classes}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        <p>
                          {formatNumber(amount)} {currency}
                        </p>
                        <p>
                          {formatNumber(fee)} {currency}
                        </p>
                      </Typography>
                    </td>
                    <td className={classes}>
                      <div className="w-max">
                        <Chip
                          size="sm"
                          variant="ghost"
                          value={
                            status === "cancel"
                              ? "Canceled"
                              : status === "success"
                                ? "Successful"
                                : "Pending"
                          }
                          color={{
                            success: "green",
                            complete: "green",
                            pending: "yellow",
                            running: "yellow",
                            cancel: "red",
                            failed: "red",
                          }[status] || "gray"} // Mặc định là "gray" nếu không khớp trạng thái
                          onClick={status === "pending" ? () => handleCancelPending(code) : undefined}
                          className={status === "pending" ? "cursor-pointer text-yellow-500" : status === "cancel" ? "text-red-400" : "text-green-400"}
                        />
                      </div>
                    </td>


                    <td className={classes}>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal capitalize"
                          >
                            {hash}
                          </Typography>
                        </div>
                      </div>
                    </td>
                    {/* <td className={classes}>
            <Tooltip content="Edit User">
              <IconButton variant="text">
                <PencilIcon className="h-4 w-4" />
              </IconButton>
            </Tooltip>
          </td> */}
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </CardBody>
      <CardFooter className="flex items-center justify-center border-t border-blue-gray-50 p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outlined"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          <Typography variant="small" color="blue-gray">
            Page {currentPage} of {totalPages}
          </Typography>

          <Button
            variant="outlined"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </CardFooter>
      <ToastContainer stacked />
    </Card>
  );
};

export default DepositTable;
