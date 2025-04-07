import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export default async function handler(req, res) {
  try {
    const params = {
      TableName: 'vbet-users', 
    };
    const result = await dynamoDB.scan(params).promise();

    // Sort the results by balance in descending order
    const sortedItems = result.Items.sort((a, b) => b.balance - a.balance);

    res.status(200).json(sortedItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}