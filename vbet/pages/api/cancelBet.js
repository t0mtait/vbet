import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { betId } = req.body;

  if (!betId || typeof betId !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing bet ID' });
  }

  try {
    // Fetch the bet details to get the user and wager amount
    const getBetParams = {
      TableName: 'vbet-bets',
      Key: { id: betId },
    };

    const betResult = await dynamoDB.get(getBetParams).promise();
    const bet = betResult.Item;

    if (!bet || !bet.user || !bet.wager) {
      return res.status(404).json({ error: 'Bet not found or invalid bet data' });
    }

    const { user, wager } = bet;

    // Delete the bet entry
    const deleteBetParams = {
      TableName: 'vbet-bets',
      Key: { id: betId },
    };

    // Increment the user's balance
    const updateUserBalanceParams = {
      TableName: 'vbet-users',
      Key: { username: user },
      UpdateExpression: 'SET balance = balance + :wager',
      ExpressionAttributeValues: {
        ':wager': wager,
      },
      ReturnValues: 'UPDATED_NEW',
    };

    const updateUserWageredParams = {
        TableName: 'vbet-users',
        Key: { username: user },
        UpdateExpression: 'SET amount_wagered = amount_wagered - :wager',
        ExpressionAttributeValues: {
          ':wager': wager,
        },
        ReturnValues: 'UPDATED_NEW',
      };

    // Perform both operations (delete bet and update balance) concurrently
    await Promise.all([
      dynamoDB.delete(deleteBetParams).promise(),
      dynamoDB.update(updateUserBalanceParams).promise(),
      dynamoDB.update(updateUserWageredParams).promise(),
    ]);

    res.status(200).json({ message: 'Bet canceled and user balance updated successfully' });
  } catch (error) {
    console.error('Error canceling bet or updating balance:', error);
    res.status(500).json({ error: 'Failed to cancel bet or update balance' });
  }
}