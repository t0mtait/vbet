import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  var { user, options, odds, amount } = req.body;


  if (!user || !options || !odds || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  user = user.trim();
  if (user == 'tom' || user == 'TOM') {
      user = 'Tom'
  }
  if (user == 'cj' || user == 'Cj') {
    user = 'CJ'
  }
  if (user == 'stef' || user == 'STEF') {
    user = 'Stef'
  }
  if (user == 'chris' || user == 'CHRIS') {
    user = 'Chris'
  }

  const formattedOptionNames = options.map(
    (option) => `${option.category}: ${option.name}`
  ).join(', ');
  
  const params = {
    TableName: 'vbet-bets',
    Item: {
      user,
      id: new Date().toISOString().replace(/[-:TZ.]/g, ''), // Readable numeric ID
      option: formattedOptionNames,
      return: odds,
      status: 'Unsettled',
      wager: parseFloat(amount),
    },
  };

  try {
    // Write to the vbet-bets table
    await dynamoDB.put(params).promise();

    // Update the user's balance and amount_wagered in the vbet-users table
    const updateParams = {
      TableName: 'vbet-users',
      Key: { username: user }, // Assuming the primary key is 'username'
      UpdateExpression: 'SET balance = balance - :wager, amount_wagered = if_not_exists(amount_wagered, :initial) + :wager',
      ExpressionAttributeValues: {
        ':wager': parseFloat(amount),
        ':initial': 0, // Initialize amount_wagered to 0 if it doesn't exist
      },
      ConditionExpression: 'balance >= :wager', // Ensure the user has enough balance
      ReturnValues: 'UPDATED_NEW',
    };

    const result = await dynamoDB.update(updateParams).promise();

    res.status(200).json({ 
      message: 'Bet placed successfully', 
      transactionId: params.Item.id,
      updatedBalance: result.Attributes.balance,
      updatedAmountWagered: result.Attributes.amount_wagered,
    });
  } catch (error) {
    console.error('Error processing request:', error);

    // Handle insufficient balance error
    if (error.code === 'ConditionalCheckFailedException') {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    res.status(500).json({ error: 'Failed to place bet' });
  }
}