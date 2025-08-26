import { app } from "./app";
import { config } from "./config/env";
import { log } from "./utils/logger";

app.listen(config.port, () => log.info(`API listening on :${config.port}`));
