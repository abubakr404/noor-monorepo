import type { Config } from "tailwindcss";
import sharedConfig from "@repo/config/tailwind";

const config: Config = {
  presets: [sharedConfig],
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
};

export default config;
