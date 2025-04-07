'use client'; 
import {Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { useEffect, useState } from "react"; 

const BetsComponent = () => {
  const [bets, setBets] = useState([]); // State to hold options data
  const [loading, setLoading] = useState(true); // State to track loading state
  const [error, setError] = useState(null); // State to track errors if any

  useEffect(() => {
    // Fetch data from API route
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getBets');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setBets(data); // Set the fetched data to state
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false); // Set loading to false when the request finishes
      }
    };

    fetchData(); // Call the function to fetch data
  }, []);

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
            <TableHeadCell>User</TableHeadCell>
            <TableHeadCell>Option</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Wager</TableHeadCell>
            <TableHeadCell>Timestamp</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody className="divide-y">
          {bets.length > 0 ? (
            bets.map((bet, index) => (
              <TableRow key={index} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">{bet.user}</TableCell>
                <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">{bet.status}</TableCell>
                <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">{bet.option}</TableCell>
                <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">{bet.wager}$</TableCell>
                <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">{bet.timestamp}</TableCell> 
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan="4" className="text-center">No users available</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
export default BetsComponent; // Default export