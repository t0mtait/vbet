'use client'; 
import { Button, Input, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, TextInput } from "flowbite-react";
import { Black_And_White_Picture } from "next/font/google";
import { useEffect, useState } from "react"; 

const OptionsComponent = () => {
  const [options, setOptions] = useState([]); // State to hold options data
  const [loading, setLoading] = useState(true); // State to track loading state
  const [error, setError] = useState(null); // State to track errors if any
  const [inputValues, setInputValues] = useState({}); // State to track input field values

  useEffect(() => {
    // Fetch data from API route
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getOptions');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setOptions(data); // Set the fetched data to state
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false); // Set loading to false when the request finishes
      }
    };

    fetchData(); // Call the function to fetch data
  }, []);

  // Handle changes in the number input fields
  const handleInputChange = (index, value) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [index]: value,
    }));
  };

  // Render loading and error states
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>Pick</TableHeadCell>
            <TableHeadCell>Return</TableHeadCell>
            <TableHeadCell>Amount</TableHeadCell>
            <TableHeadCell>Place bet</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody className="divide-y">
        {options.length > 0 ? (
          options.map((option, index) => (
            <TableRow key={index} className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                {option.name}
              </TableCell>
              <TableCell>{option.odds}</TableCell>
              <TableCell>
                <TextInput id={`input-${index}`} type="number" />
              </TableCell>
              <TableCell>
                <Button>Wager</Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan="4" className="text-center">
              No options available
            </TableCell>
          </TableRow>
        )}
      </TableBody>
      </Table>
    </div>
  );
};
export default OptionsComponent; // Default export