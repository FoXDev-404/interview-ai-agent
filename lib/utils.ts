import { interviewCovers, mappings } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

const normalizeTechName = (tech: string) => {
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return mappings[key as keyof typeof mappings];
};

const checkIconExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok; // Returns true if the icon exists
  } catch {
    return false;
  }
};

export const getTechLogos = async (techArray: string[]) => {
  const logoURLs = techArray.map((tech) => {
    const normalized = normalizeTechName(tech);
    return {
      tech,
      url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
    };
  });

  const results = await Promise.all(
    logoURLs.map(async ({ tech, url }) => ({
      tech,
      url: (await checkIconExists(url)) ? url : "/tech.svg",
    }))
  );

  return results;
};

// Get interview cover based on index to ensure different covers for each card
export const getInterviewCoverByIndex = (index: number) => {
  const coverIndex = index % interviewCovers.length;
  return `/covers${interviewCovers[coverIndex]}`;
};

// Fallback random cover function
export const getRandomInterviewCover = () => {
  const randomIndex = Math.floor(Math.random() * interviewCovers.length);
  return `/covers${interviewCovers[randomIndex]}`;
};

// Available icons for random selection
const availableIcons = [
  "/calendar.svg",
  "/star.svg", 
  "/file.svg",
  "/globe.svg",
  "/profile.svg",
  "/react.svg",
  "/tailwind.svg",
  "/tech.svg",
  "/upload.svg",
  "/window.svg",
  // Adding more variety by reusing icons in different combinations
  "/logo.svg",
  "/ai-avatar.png",
  "/robot.png"
];

// Get icons based on index to ensure different icons for each card
export const getIconPairByIndex = (index: number) => {
  // Create different combinations for each index to ensure variety
  const iconCombinations = [
    { firstIcon: "/calendar.svg", secondIcon: "/star.svg" },
    { firstIcon: "/file.svg", secondIcon: "/globe.svg" },
    { firstIcon: "/profile.svg", secondIcon: "/react.svg" },
    { firstIcon: "/tailwind.svg", secondIcon: "/tech.svg" },
    { firstIcon: "/upload.svg", secondIcon: "/window.svg" },
    { firstIcon: "/logo.svg", secondIcon: "/calendar.svg" },
    { firstIcon: "/star.svg", secondIcon: "/file.svg" },
    { firstIcon: "/globe.svg", secondIcon: "/profile.svg" },
    { firstIcon: "/react.svg", secondIcon: "/tailwind.svg" },
    { firstIcon: "/tech.svg", secondIcon: "/upload.svg" }
  ];
  
  const combinationIndex = index % iconCombinations.length;
  return iconCombinations[combinationIndex];
};

// Fallback random functions
export const getRandomIcon = () => {
  const randomIndex = Math.floor(Math.random() * availableIcons.length);
  return availableIcons[randomIndex];
};

export const getRandomIconPair = () => {
  const shuffled = [...availableIcons].sort(() => Math.random() - 0.5);
  return {
    firstIcon: shuffled[0],
    secondIcon: shuffled[1]
  };
};
