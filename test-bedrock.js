require("dotenv").config();
const { BedrockRuntimeClient, ConverseCommand } = require("@aws-sdk/client-bedrock-runtime");

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function runTest() {
  try {
    const command = new ConverseCommand({
      modelId: "us.amazon.nova-lite-v1:0",
      messages: [
        {
          role: "user",
          content: [{ text: "Hello Nova, tell me a quick joke." }],
        },
      ],
    });

    const response = await client.send(command);
    console.log("SUCCESS! Model Response:\n", response.output.message.content[0].text);
  } catch (err) {
    console.error("BEDROCK TEST FAILED ❌\n", err.name, ":", err.message);
  }
}

runTest();