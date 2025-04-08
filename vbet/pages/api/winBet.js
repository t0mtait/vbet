import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, increment, betId } = req.body;

  if (!username || increment === undefined || !betId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Update the user's balance
  const updateBalanceParams = {
    TableName: 'vbet-users',
    Key: { username },
    UpdateExpression: 'SET balance = balance + :increment',
    ExpressionAttributeValues: {
      ':increment': increment,
    },
    ReturnValues: 'UPDATED_NEW',
  };

  // Update the bet's status to "Won"
  const updateBetStatusParams = {
    TableName: 'vbet-bets',
    Key: { id: betId },
    UpdateExpression: 'SET #status = :status',
    ExpressionAttributeNames: {
      '#status': 'status', // Use ExpressionAttributeNames to handle reserved keywords
    },
    ExpressionAttributeValues: {
      ':status': 'Won',
    },
    ReturnValues: 'UPDATED_NEW',
  };

  const updateUserRecordParams = {
    TableName: 'vbet-users',
    Key: { username: username },
    UpdateExpression: 'SET bets_won = if_not_exists(bets_won, :initialValue) + :incrementValue', // Initialize to 0 if it doesn't exist, then increment
    ExpressionAttributeValues: {
      ':initialValue': 0, // Initial value if bets_won doesn't exist
      ':incrementValue': 1, // Increment by 1
    },
    ReturnValues: 'UPDATED_NEW',
  };

  try {
    // Perform both updates
    const [balanceResult, betStatusResult] = await Promise.all([
      dynamoDB.update(updateBalanceParams).promise(),
      dynamoDB.update(updateBetStatusParams).promise(),
      dynamoDB.update(updateUserRecordParams).promise(),
    ]);

    res.status(200).json({
      message: 'Bet status updated successfully',
      updatedBalance: balanceResult.Attributes.balance,
      updatedBetStatus: betStatusResult.Attributes.status,
    });
  } catch (error) {
    console.error('Error updating balance or bet status:', error);
    res.status(500).json({ error: 'Failed to update balance or bet status' });
  }
}