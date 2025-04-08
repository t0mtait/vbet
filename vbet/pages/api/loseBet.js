import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, betId } = req.body;

  if (!username || typeof username !== 'string' || !betId || typeof betId !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing required fields' });
  }

  // Update the bet's status to "Lost"
  const updateBetStatusParams = {
    TableName: 'vbet-bets',
    Key: { id: betId },
    UpdateExpression: 'SET #status = :status',
    ExpressionAttributeNames: {
      '#status': 'status', // Use ExpressionAttributeNames to handle reserved keywords
    },
    ExpressionAttributeValues: {
      ':status': 'Lost',
    },
    ReturnValues: 'UPDATED_NEW',
  };

  // Increment the user's "bets_lost" count
  const updateUserRecordParams = {
    TableName: 'vbet-users',
    Key: { username: username },
    UpdateExpression: 'SET bets_lost = if_not_exists(bets_lost, :initialValue) + :incrementValue', // Initialize to 0 if it doesn't exist, then increment
    ExpressionAttributeValues: {
      ':initialValue': 0, // Initial value if bets_lost doesn't exist
      ':incrementValue': 1, // Increment by 1
    },
    ReturnValues: 'UPDATED_NEW',
  };

  try {
    // Perform both updates
    const [userRecordResult, betStatusResult] = await Promise.all([
      dynamoDB.update(updateUserRecordParams).promise(),
      dynamoDB.update(updateBetStatusParams).promise(),
    ]);

    res.status(200).json({
      message: 'Bet status updated successfully',
      updatedBetsLost: userRecordResult.Attributes.bets_lost,
      updatedBetStatus: betStatusResult.Attributes.status,
    });
  } catch (error) {
    console.error('Error updating bet status or user record:', error);
    res.status(500).json({ error: 'Failed to update bet status or user record' });
  }
}