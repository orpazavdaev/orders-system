import { createApp } from "./app";

const port = Number(process.env.PORT) || 8080;
const app = createApp();

app.listen(port, "0.0.0.0", () => {
  console.log(`Order API listening on port ${port}`);
});
