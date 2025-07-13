import { forwardRef } from "react";
import { Box, Center, Icon } from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CalendarIcon from "./icons/CalendarIcon";

const DateCustomInput = forwardRef(({ value, onClick, clearDate }, ref) => (
  <Center ref={ref}>
    {value}
  </Center>
));

const DateCell = ({ getValue, row, column, table }) => {
  const date = getValue();
  const { updateData } = table.options.meta;
  return (
    <DatePicker
      wrapperClassName="date-wrapper"
      dateFormat="HH:mm:ss dd/MM/yyyy"
      selected={date}
      onChange={(date) => updateData(row.index, column.id, date)}
      customInput={
        <DateCustomInput
          clearDate={() => updateData(row.index, column.id, null)}
        />
      }
    />
  );
};
export default DateCell;