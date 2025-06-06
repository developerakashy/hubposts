import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}


export function getTimeRemaining(postAt) {
  const now = new Date();
  const diffMs = new Date(postAt) - now;

  if (diffMs <= 0) return 'Already posted';

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} to go`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} to go`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} to go`;
  return `${seconds} second${seconds !== 1 ? 's' : ''} to go`;
}

export function formatDateAndTime(postAt){
  if (!postAt) return "Invalid Date";

  const postTime = postAt instanceof Date ? postAt : new Date(postAt);

  if (isNaN(postTime)) return "Invalid Date";

  const dateOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };

  const timeOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  const formattedDate = new Intl.DateTimeFormat('en-IN', dateOptions).format(postTime);
  const formattedTime = new Intl.DateTimeFormat('en-IN', timeOptions).format(postTime);

  return `${formattedDate}, ${formattedTime}`;
}
