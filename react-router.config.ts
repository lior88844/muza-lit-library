import type { Config } from "@react-router/dev/config";
import { resolve } from "path";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  buildDirectory: resolve(__dirname, "server/reactServer"),
  ssr: true,
} satisfies Config;
