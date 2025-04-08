import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();


export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const { user, optionName, odds, amount } = req.body;
  
    if (!user || !optionName || !odds || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    const params = {
      TableName: 'vbet-bets',
      Item: {
        user: 'test',
        id: Date.now().toString(), // Unique ID based on the current timestamp
        option: optionName,
        status: 'unsettled',
        wager: parseFloat(amount),
      },
    };
  
    try {
      await dynamoDB.put(params).promise();
      res.status(200).json({ message: 'Bet placed successfully', transactionId: params.Item.id });
    } catch (error) {
      console.error('Error writing to DynamoDB:', error);
      res.status(500).json({ error: 'Failed to place bet' });
    }
  }