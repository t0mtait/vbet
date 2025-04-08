'use client';
import { Button, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, TextInput } from "flowbite-react";
import { useEffect, useState } from "react"; 

const OptionsComponent = () => {
  const [options, setOptions] = useState([]); // State to hold options data
  const [loading, setLoading] = useState(true); // State to track loading state
  const [error, setError] = useState(null); // State to track errors if any
  const [inputValues, setInputValues] = useState({}); // State to track input field values
  const [username, setUsername] = useState(''); // State to track the username input


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

  const handleWagerClick = async (option, index) => {
    const amount = inputValues[index]; // Get the input value for the corresponding row
    if (!amount) {
      alert("Please enter an amount before placing a wager.");
      return;
    }
  
    try {
      const response = await fetch('/api/submitPick', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: username,
          optionName: option.name, // Corrected to pass the actual value
          odds: option.odds,
          amount: parseFloat(amount),
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to place bet: ${response.statusText}`);
      }
  
      const result = await response.json();
      alert(`Bet placed successfully! Transaction ID: ${result.transactionId}`);
    } catch (error) {
      console.error("Error placing bet:", error); // Log the actual error
      alert("Failed to place bet. Please try again.");
    }
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
       <TextInput
        id="username"
        type="text"
        placeholder="Enter username here..."
        value={username}
        onChange={(e) => setUsername(e.target.value)} // Update the username state
      />
      
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="text-white">Pick</TableHeadCell>
            <TableHeadCell className="text-white">Return</TableHeadCell>
            <TableHeadCell className="text-white">Amount</TableHeadCell>
            <TableHeadCell className="text-white">Place bet</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody className="divide-y">
          {options.length > 0 ? (
            options.map((option, index) => (
              <TableRow key={index} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                <TableCell className="whitespace-nowrap font-medium text-white">
                  {option.name}
                </TableCell>
                <TableCell className="text-white">{option.odds}</TableCell>
                <TableCell>
                  <TextInput
                    id={`input-${index}`}
                    type="number"
                    onChange={(e) => handleInputChange(index, e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Button onClick={() => handleWagerClick(option, index)}>Wager</Button>
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

export default OptionsComponent;