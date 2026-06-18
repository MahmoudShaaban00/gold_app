import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const sns = new SNSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const sendSMS = async (phone, message) => {
  try {
    const command = new PublishCommand({
      Message: message,
      PhoneNumber: phone, // لازم +20 format
    });

    const response = await sns.send(command);

    console.log("AWS SMS Sent:", response.MessageId);

    return response;
  } catch (error) {
    console.log("AWS SMS Error:", error);
    throw error;
  }
};