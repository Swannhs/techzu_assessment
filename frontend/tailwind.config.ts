import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#11211c",
        moss: "#1f3a31",
        mist: "#eef4ef",
        peach: "#f4e3d4",
        ember: "#b05637"
      },
      boxShadow: {
        float: "0 16px 60px rgba(17, 33, 28, 0.12)"
      }
    }
  },
  plugins: []
} satisfies Config;
