import { Box, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";

// Status Color Icon component
export const ColorIcon = ({ color, ...props }) => (
  <Box w="12px" h="12px" bg={color} borderRadius="3px" {...props} />
);

// Status constants
const STATUS_IN_PENDING = { id: 0, name: "PENDING", color: "yellow.400" };
const STATUS_IN_SUCCESS = { id: 1, name: "SUCCESS", color: "green.400" };
const STATUS_IN_CANCEL = { id: 2, name: "CANCELED", color: "red.400" };

// Status list for reference
export const STATUSES = [
  STATUS_IN_PENDING,
  STATUS_IN_SUCCESS,
  STATUS_IN_CANCEL,
];

// StatusCell component
const TransactionStatusCell = ({ getValue }) => {
  // Extract the status from the value using getValue()
  const statusId = getValue();

  // Map statusId to the corresponding status object from STATUSES
  const status = STATUSES.find((s) => s.id === statusId) || {};

  // Destructure name and color from the status object (with fallbacks)
  const { name = "Unknown", color = "gray.300" } = status;

  return (
    <Menu isLazy offset={[0, 0]} flip={false} autoSelect={false}>
      <MenuButton
        h="100%"
        w="100%"
        textAlign="left"
        p={1.5}
        bg={color || "transparent"}
        color="gray.900"
        borderRadius="4px"
      >
        {name}
      </MenuButton>
      <MenuList>
        <MenuItem>{name}</MenuItem>
      </MenuList>
    </Menu>
  );
};

export default TransactionStatusCell;
