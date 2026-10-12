import { Geist, Geist_Mono, Lato, Roboto } from "next/font/google";

/* Geist Mono, the face of the sign up buttons (the hero's and the nav's) */
export const mono = Geist_Mono({ subsets: ["latin"], weight: ["400", "500"], display: "swap" });

/* Geist, the sans of the How Loats work section */
export const geist = Geist({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });

/* the faces the Wherever your team works section draws its Slack and
   Gmail windows in */
export const lato = Lato({ subsets: ["latin"], weight: ["400", "700", "900"], display: "swap" });
export const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500"], display: "swap" });
