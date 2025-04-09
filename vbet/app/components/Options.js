'use client';
import { Button, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, TextInput } from "flowbite-react";
import { useEffect, useState } from "react"; 

const OptionsComponent = () => {
  const [options, setOptions] = useState([]); // State to hold options data
  const [loading, setLoading] = useState(true); // State to track loading state
  const [error, setError] = useState(null); // State to track errors if any
  const [inputValues, setInputValues] = useState({}); // State to track input field values
  const [username, setUsername] = useState(''); // State to track the username input
  const [wager, setWager] = useState(''); // State to track the wager amount

  useEffect(() => {
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

  
  
  const addToSlip = (option, index) => {
    if (inputValues[index]) {
      alert("This option is already in the bet slip.");
      return;
    }
    setInputValues((prevValues) => {
      const currentAmount = prevValues[index] || 1; // Default to 1 if no value exists
      const updatedAmount = currentAmount * option.odds; // Multiply by the option's return (odds)
      return {
        ...prevValues,
        [index]: updatedAmount, // Update the value for the corresponding row
      };
    });
  };

  const placeBet = async () => {
    if (!username) {
      alert("Please enter a username.");
      return;
    }
  
    if (!wager || parseFloat(wager) <= 0) {
      alert("Please enter a valid wager amount.");
      return;
    }
  
    if (Object.entries(inputValues).length === 0) {
      alert("No options selected.");
      return;
    }
  
    const selectedOptions = Object.entries(inputValues)
      .filter(([index]) => options[index]) // Ensure the option exists
      .map(([index]) => ({
        name: options[index]?.name,
        odds: options[index]?.odds,
      }));
  
    const totalOdds = Object.entries(inputValues).reduce(
      (total, [index]) => total * (options[index]?.odds || 1),
      1
    ).toFixed(2);
  
    try {
      const response = await fetch('/api/submitPick', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: username,
          amount: parseFloat(wager), // Include wager in the request
          optionName: selectedOptions.map((option) => option.name).join(', '), // Join names with a comma and space
          odds: totalOdds,
        }),
      });
  
      if (!response.ok) {
        // Attempt to parse the error response as JSON
        let errorMessage = `Failed to place bet: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error("Error parsing JSON response:", e);
        }
        throw new Error(errorMessage);
      }
  
      alert('Bet placed successfully! Your bet slip has been cleared.');
      setInputValues({}); // Clear the bet slip after placing the bet
      setWager(''); // Clear the wager field
    } catch (error) {
      console.error('Error placing bet:', error);
      alert(`Failed to place the bet: ${error.message}`);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="overflow-x-auto">
      
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white">Current Bet Slip</h2>
        {Object.entries(inputValues).length > 0 ? (
          <>
            <ul className="text-white">
              {Object.entries(inputValues).map(([index, value]) => (
                <li key={index}>
                  {options[index]?.name || "Unknown Option"}: {value}x
                </li>
              ))}
            </ul>
            <p className="text-white font-bold mt-2">
              Total Odds:{" "}
              {Object.entries(inputValues).reduce(
                (total, [index]) => total * options[index]?.odds || 1,
                1
              ).toFixed(2)}
            </p>
            
          </>
        ) : (
          <p className="text-white">No picks added yet.</p>
        )}
      </div>
      <div className="flex items-center space-x-4 mb-2">
        <TextInput
          id="username"
          type="text"
          placeholder="Enter username here..."
          value={username}
          onChange={(e) => setUsername(e.target.value)} // Update the username state
          className="w-1/2"
        />
        <TextInput
          id="wager"
          type="number"
          placeholder="Enter wager amount..."
          value={wager}
          onChange={(e) => setWager(e.target.value)} // Update the wager state
          className="w-1/2"
        />
      </div>
      <div className="flex items-center space-x-4 mb-4">
      <Button
              className="mt-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-1/2"
              onClick={() => setInputValues({})} // Reset the inputValues state
      >Clear
      </Button>
      <Button
              className="mt-2 bg-green-500 hover:bg-green-600 text-white rounded-full ml-2 w-1/2"
              onClick={placeBet} // Trigger the placeBet function
      >Place</Button>
      </div>

      <Table className="bg-gray-800">
        <TableHead>
          <TableRow>
            <TableHeadCell className="text-white bg-gray-800">Pick</TableHeadCell>
            <TableHeadCell className="text-white bg-gray-800">Return</TableHeadCell>
            <TableHeadCell className="text-white bg-gray-800">Add to slip</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody className="divide-y">
  {options.length > 0 ? (
    options.map((option, index) => (
      <TableRow
        key={index}
        className="bg-white border-gray-700 bg-gray-800 text-sm h-8" // Reduce height and font size
      >
        <TableCell className="whitespace-nowrap font-medium text-white p-2">
          {option.name}
        </TableCell>
        <TableCell className="text-white p-2">{option.odds}</TableCell>
        <TableCell className="p-2">
          <div className="flex items-center space-x-2">
            <Button
              className="text-xs py-1 px-10 rounded-full " // Smaller button size
              onClick={() => addToSlip(option, index)}
            >
              Add
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan="4" className="text-center p-2">
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