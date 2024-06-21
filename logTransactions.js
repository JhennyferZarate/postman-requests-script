const newman = require("newman");
const fs = require("fs").promises;

async function runCollectionAndLogResponses(collectionPath, environmentPath) {
  const { run } = newman;
  const collection = require(collectionPath);
  const environment = require(environmentPath);

  run({ collection, environment, reporters: "cli" }).on(
    "request",
    async function (err, { item, request, response }) {
      if (err) {
        throw err;
      }

      const { name } = item;

      const requestBody =
        request.body && request.body.mode === "urlencoded"
          ? formatUrlEncodedBody(request.body.urlencoded)
          : "No request body";

      const responseBody = response.stream.toString();

      const logContent = `
-------------------
Request: ${name}
Input parameters:
${requestBody}

Output parameters:
${responseBody}
-------------------
`;

      try {
        await fs.appendFile("transaction_log.txt", logContent);
      } catch (error) {
        console.error("Error writing to log file:", error);
      }
    }
  );
}

function formatUrlEncodedBody(bodyData) {
  return bodyData.map(({ key, value }) => `${key}: ${value}`).join("\n");
}

runCollectionAndLogResponses(
  "./Transactions.postman_collection.json",
  "./Stripe Enviroments.postman_environment.json"
);
