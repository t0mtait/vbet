import { TextInput, Button } from "flowbite-react";
import { useState } from "react";

const SettlerComponent = () => {
  const [betId, setBetId] = useState(''); // State to track the bet ID input

  const handleWinClick = async () => {
    if (!betId) {
      alert("Please enter a Bet ID.");
      return;
    }

    try {
      // Fetch the bet entry by ID
      const betResponse = await fetch(`/api/getBet?id=${betId}`);
      if (!betResponse.ok) {
        throw new Error(`Failed to fetch bet: ${betResponse.statusText}`);
      }
      const bet = await betResponse.json();

      // Increment the user's balance by the return value of the bet
      const updateResponse = await fetch('/api/winBet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: bet.user, // The user associated with the bet
          increment: bet.return * bet.wager, // Increment the balance by the return value
          betId: bet.id
        }),
      });

      if (!updateResponse.ok) {
        throw new Error(`Failed to update user balance: ${updateResponse.statusText}`);
      }

      alert(`User's balance updated successfully!`);
    } catch (error) {
      console.error("Error handling win:", error);
      alert("Failed to process the win. Please try again.");
    }
  };

  const handleLoseClick = async () => {
    if (!betId) {
      alert("Please enter a Bet ID.");
      return;
    }
  
    try {
      // Fetch the bet entry by ID
      const betResponse = await fetch(`/api/getBet?id=${betId}`);
      if (!betResponse.ok) {
        throw new Error(`Failed to fetch bet: ${betResponse.statusText}`);
      }
      const bet = await betResponse.json();
  
      if (!bet.user || !bet.id) {
        throw new Error("Invalid bet data received from the server.");
      }
  
      // Update the bet's status to "Lost"
      const updateResponse = await fetch('/api/loseBet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: bet.user,
          betId: bet.id,
        }),
      });
  
      if (!updateResponse.ok) {
        throw new Error(`Failed to update bet status: ${updateResponse.statusText}`);
      }
  
      alert(`Bet status updated successfully!`);
    } catch (error) {
      console.error("Error handling loss:", error);
      alert("Failed to process the loss. Please try again.");
    } 
  };

  const handleCancelClick = async () => {
    if (!betId) {
      alert("Please enter a Bet ID.");
      return;
    }
  
    try {
      const response = await fetch('/api/cancelBet', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ betId }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to delete bet: ${response.statusText}`);
      }
  
      alert('Bet deleted successfully!');
    } catch (error) {
      console.error('Error deleting bet:', error);
      alert('Failed to delete the bet. Please try again.');
    }
  };

  return (
    <div className="overflow-x-auto w-full">
      <div className="flex w-full">
        <TextInput
          id="betId"
          type="text"
          placeholder="Enter Bet ID..."
          value={betId}
          onChange={(e) => setBetId(e.target.value)} // Update the betId state
          className="w-1/2" // Make the TextInput take 50% of the width
        />
        <div className="flex w-1/2">
          <Button className="w-1/3 bg-green-400" onClick={handleWinClick}>
            Win
          </Button>
          <Button className="w-1/3 bg-red-400" onClick={handleLoseClick}>Lose</Button>
          <Button className="w-1/3 bg-yellow-400" onClick={handleCancelClick}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};

export default SettlerComponent;