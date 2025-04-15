'use client';
import { Button,TextInput, Select } from "flowbite-react";
import { useEffect, useState } from "react"; 

const OptionsComponent = () => {
  const [options, setOptions] = useState([]); // State to hold options data
  const [loading, setLoading] = useState(true); // State to track loading state
  const [error, setError] = useState(null); // State to track errors if any
  const [inputValues, setInputValues] = useState({}); // State to track input field values
  const [username, setUsername] = useState(''); // State to track the username input
  const [wager, setWager] = useState(''); // State to track the wager amount
  const [groupedOptions, setGroupedOptions] = useState({}); // State to hold grouped options by category

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getOptions');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
         // Group options by category
         const grouped = data.reduce((acc, option) => {
          const category = option.category || 'Other'; // Default to "Other" if no category
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(option);
          return acc;
        }, {});

        setOptions(data); // Set the fetched data to state
        setGroupedOptions(grouped); // Set grouped options
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false); // Set loading to false when the request finishes
      }
    };

    fetchData(); // Call the function to fetch data
  }, []);

  const addToSlip = (option) => {
    // Check if the option is already in the bet slip by comparing its id
    const isOptionInSlip = Object.values(inputValues).some(
      (existingOption) => existingOption.id === option.id
    );
  
    if (isOptionInSlip) {
      alert("This option is already in the bet slip.");
      return;
    }
  
    // Add the option to the bet slip
    setInputValues((prevValues) => ({
      ...prevValues,
      [option.id]: option, // Use the option's id as the key
    }));
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
  
    const selectedOptions = Object.values(inputValues).map((option) => ({
      name: option.name,
      category: option.category,
      odds: option.odds,
    }))

  
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
          options: selectedOptions,
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
              {Object.values(inputValues).map((option) => (
                <li key={option.id}>
                 [{option.category}] {option.name || "Unknown Option"} - ({option.odds}x)
                </li>
              ))}
            </ul>
            <p className="text-white font-bold mt-2">
              Total Odds:{" "}
              {Object.values(inputValues).reduce(
                (total, option) => total * option.odds || 1,
                1
              ).toFixed(2)}x
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

     {/* Dropdowns for each category */}
     {['Other', 'Chris', 'CJ', 'Stef', 'Tom'].map((category) => (
        <div key={category} className="mb-4">
          <h3 className="text-md font-bold text-white">{category}</h3>
          <Select
            className="w-full"
            onChange={(e) => {
              const selectedId = e.target.value; // Get the selected id from the dropdown
              if (selectedId) {
                const selectedOption = groupedOptions[category].find(
                  (option) => option.id.toString() === selectedId // Ensure id comparison works
                );
                if (selectedOption) {
                  addToSlip(selectedOption); // Pass the selected option object
                } else {
                  console.error("Selected option not found in groupedOptions");
                }
              }
            }}
          >
            <option value="">Select an option</option>
            {groupedOptions[category]?.map((option) => (
              <option key={option.id} value={option.id.toString()}>
                {option.name} - ({option.odds}x)
              </option>
            ))}
          </Select>
        </div>
      ))}


    </div>
  );
};

export default OptionsComponent;