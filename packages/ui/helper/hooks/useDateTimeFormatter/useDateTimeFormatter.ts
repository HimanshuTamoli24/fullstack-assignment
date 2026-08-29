/**
 * Example:
 * const { formatted } = useDateTimeFormatter("12-JUNE-2005", { format: "MM/DD/YY" }); // "06/12/05"
 * const verbal = formatDateTime("17:28", { verbalTime: "clock" }); // "twenty-eight minutes past five"
 */

import { useState, useMemo } from "react";

export interface FormatDateTimeOptions {
  /**
   * The output format layout. Default is "YYYY-MM-DD"
   * E.g. "DD-MM-YYYY", "MM-DD-YY", "YYYY-MM-DD", "DD MMMM YYYY"
   */
  format?: string;

  /**
   * Override separator/punctuation. If provided, replaces separators in format with this character.
   * E.g. if format is "DD-MM-YYYY" and separator is "/", output is "DD/MM/YYYY"
   */
  separator?: string;

  /**
   * Time formatting options.
   * "12h" or "24h" or "none" (default: "none")
   */
  timeFormat?: "12h" | "24h" | "none";

  /**
   * Whether to include seconds in time. (default: false)
   */
  includeSeconds?: boolean;

  /**
   * Whether to format time verbally.
   * "simple" (e.g. "five twenty-eight"), "clock" (e.g. "twenty-eight minutes past five"), or "none" (default: "none")
   */
  verbalTime?: "simple" | "clock" | "none";

  /**
   * Whether to format date verbally.
   * "ordinal" (e.g. "the twelfth of June, two thousand five"), "simple" (e.g. "June twelfth, two thousand five"), or "none" (default: "none")
   */
  verbalDate?: "ordinal" | "simple" | "none";

  /**
   * Case for output string (e.g. uppercase, lowercase, capitalized, or default)
   */
  casing?: "uppercase" | "lowercase" | "capitalize" | "none";
}

const ONES = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];

const TENS = ["", "", "twenty", "thirty", "forty", "fifty"];

const ORDINALS = [
  "",
  "first",
  "second",
  "third",
  "fourth",
  "fifth",
  "sixth",
  "seventh",
  "eighth",
  "ninth",
  "tenth",
  "eleventh",
  "twelfth",
  "thirteenth",
  "fourteenth",
  "fifteenth",
  "sixteenth",
  "seventeenth",
  "eighteenth",
  "nineteenth",
  "twentieth",
  "twenty-first",
  "twenty-second",
  "twenty-third",
  "twenty-fourth",
  "twenty-fifth",
  "twenty-sixth",
  "twenty-seventh",
  "twenty-eighth",
  "twenty-ninth",
  "thirtieth",
  "thirty-first",
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTH_SHORT_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function numberToWords(num: number): string {
  if (num < 20) return ONES[num] || "";
  const tenVal = Math.floor(num / 10);
  const oneVal = num % 10;
  return oneVal === 0 ? TENS[tenVal] || "" : `${TENS[tenVal]}-${ONES[oneVal]}`;
}

function yearToWords(year: number): string {
  if (year >= 2000 && year < 2100) {
    const decade = year % 100;
    if (decade === 0) return "two thousand";
    return `two thousand ${numberToWords(decade)}`;
  }
  const century = Math.floor(year / 100);
  const decade = year % 100;
  if (decade === 0) return `${numberToWords(century)} hundred`;
  return `${numberToWords(century)} ${numberToWords(decade)}`;
}

export function timeToVerbal(
  hours: number,
  minutes: number,
  type: "simple" | "clock" = "simple",
): string {
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const nextHour12 = (hours + 1) % 12 === 0 ? 12 : (hours + 1) % 12;

  const hourWord = numberToWords(hour12);
  const nextHourWord = numberToWords(nextHour12);

  if (type === "simple") {
    if (minutes === 0) {
      return `${hourWord} o'clock`;
    }
    const minuteWord = numberToWords(minutes);
    return `${hourWord} ${minuteWord}`;
  }

  // type === 'clock'
  if (minutes === 0) {
    return `${hourWord} o'clock`;
  }
  if (minutes === 15) {
    return `quarter past ${hourWord}`;
  }
  if (minutes === 30) {
    return `half past ${hourWord}`;
  }
  if (minutes === 45) {
    return `quarter to ${nextHourWord}`;
  }
  if (minutes < 30) {
    const minWord = numberToWords(minutes);
    return `${minWord} ${minutes === 1 ? "minute" : "minutes"} past ${hourWord}`;
  } else {
    const minWord = numberToWords(60 - minutes);
    return `${minWord} ${60 - minutes === 1 ? "minute" : "minutes"} to ${nextHourWord}`;
  }
}

export function dateToVerbal(
  year: number,
  month: number,
  day: number,
  type: "ordinal" | "simple" = "ordinal",
): string {
  const monthName = MONTH_NAMES[month] || "";
  const dayWord = ORDINALS[day] || String(day);
  const yearWord = yearToWords(year);

  if (type === "simple") {
    return `${monthName} ${dayWord}, ${yearWord}`;
  }
  return `the ${dayWord} of ${monthName}, ${yearWord}`;
}

export function parseDateTime(input: unknown): Date | null {
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }
  if (typeof input === "number") {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return null;

    // Pre-sanitize double dashes or typical typos
    const sanitized = trimmed.replace(/--/g, "00");

    // 1. Check if it's numeric timestamp string
    if (/^\d+$/.test(sanitized)) {
      const d = new Date(Number(sanitized));
      if (!isNaN(d.getTime())) return d;
    }

    // 2. Try parsing standard ISO strings (starts with YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}/.test(sanitized)) {
      const isoDate = new Date(sanitized);
      if (!isNaN(isoDate.getTime())) return isoDate;
    }

    // 3. Custom fallback parser for non-standard formats (e.g. 12-JUNE-2005)
    // Replace delimiters with spaces
    const normalized = sanitized.replace(/[-/.,]/g, " ").replace(/\s+/g, " ");
    const tokens = normalized.split(" ");

    let day: number | null = null;
    let month: number | null = null;
    let year: number | null = null;
    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    // Extract time token if exists (contains colon)
    const dateTokens: string[] = [];
    for (const token of tokens) {
      if (token.includes(":")) {
        const timeParts = token.split(":");
        hours = parseInt(timeParts[0] || "0", 10);
        minutes = parseInt(timeParts[1] || "0", 10);
        seconds = parseInt(timeParts[2] || "0", 10);
      } else {
        dateTokens.push(token);
      }
    }

    if (dateTokens.length >= 3) {
      // Find named month
      for (let i = 0; i < dateTokens.length; i++) {
        const tokLower = dateTokens[i]!.toLowerCase();
        const longIdx = MONTH_NAMES.map((m) => m.toLowerCase()).indexOf(tokLower);
        if (longIdx !== -1) {
          month = longIdx;
          dateTokens.splice(i, 1);
          break;
        }
        const shortIdx = MONTH_SHORT_NAMES.map((m) => m.toLowerCase()).indexOf(tokLower);
        if (shortIdx !== -1) {
          month = shortIdx;
          dateTokens.splice(i, 1);
          break;
        }
      }

      if (month !== null && dateTokens.length >= 2) {
        const t0 = parseInt(dateTokens[0]!, 10);
        const t1 = parseInt(dateTokens[1]!, 10);
        if (t0 > 31 || dateTokens[0]!.length === 4) {
          year = t0;
          day = t1;
        } else if (t1 > 31 || dateTokens[1]!.length === 4) {
          year = t1;
          day = t0;
        } else {
          // Defaults: Day Month Year (e.g. 12 JUNE 2005)
          if (t1 > t0) {
            year = t1;
            day = t0;
          } else {
            year = t0;
            day = t1;
          }
        }
      } else if (dateTokens.length >= 3) {
        const p0 = parseInt(dateTokens[0]!, 10);
        const p1 = parseInt(dateTokens[1]!, 10);
        const p2 = parseInt(dateTokens[2]!, 10);

        if (dateTokens[0]!.length === 4 || p0 > 31) {
          year = p0;
          month = p1 - 1;
          day = p2;
        } else if (dateTokens[2]!.length === 4 || p2 > 31) {
          year = p2;
          if (p0 > 12) {
            day = p0;
            month = p1 - 1;
          } else if (p1 > 12) {
            day = p1;
            month = p0 - 1;
          } else {
            // Assume DD-MM-YYYY
            day = p0;
            month = p1 - 1;
          }
        }
      }
    }

    if (year !== null && month !== null && day !== null) {
      if (year < 100) {
        year += year < 50 ? 2000 : 1900;
      }
      const d = new Date(year, month, day, hours, minutes, seconds);
      if (!isNaN(d.getTime())) return d;
    }

    // Last resort fallback
    const lastResort = new Date(sanitized);
    if (!isNaN(lastResort.getTime())) return lastResort;
  }
  return null;
}

export function formatDateTime(input: unknown, options: FormatDateTimeOptions = {}): string {
  const date = parseDateTime(input);
  if (!date) return "";

  const {
    format: formatPattern = "YYYY-MM-DD",
    separator,
    timeFormat = "none",
    includeSeconds = false,
    verbalTime = "none",
    verbalDate = "none",
    casing = "none",
  } = options;

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  const pad = (n: number) => String(n).padStart(2, "0");

  let dateFormatted = "";

  if (verbalDate !== "none") {
    dateFormatted = dateToVerbal(year, month, day, verbalDate);
  } else {
    dateFormatted = formatPattern;
    // Replace year
    dateFormatted = dateFormatted.replace(/YYYY/g, String(year));
    dateFormatted = dateFormatted.replace(/YY/g, String(year).slice(-2));
    // Replace month names/digits
    dateFormatted = dateFormatted.replace(/MMMM/g, MONTH_NAMES[month] || "");
    dateFormatted = dateFormatted.replace(/MMM/g, MONTH_SHORT_NAMES[month] || "");
    dateFormatted = dateFormatted.replace(/MM/g, pad(month + 1));
    dateFormatted = dateFormatted.replace(/M(?!a|u)/g, String(month + 1));
    // Replace day digits
    dateFormatted = dateFormatted.replace(/DD/g, pad(day));
    dateFormatted = dateFormatted.replace(/D(?!e)/g, String(day));

    // Handle custom separator substitution if separator is provided
    if (separator !== undefined) {
      dateFormatted = dateFormatted.replace(/[-/.\s]+/g, separator);
    }
  }

  // Handle time formatting
  let timeFormatted = "";
  if (verbalTime !== "none") {
    timeFormatted = timeToVerbal(hours, minutes, verbalTime);
  } else if (timeFormat !== "none") {
    if (timeFormat === "24h") {
      timeFormatted = `${pad(hours)}:${pad(minutes)}`;
      if (includeSeconds) {
        timeFormatted += `:${pad(seconds)}`;
      }
    } else {
      const period = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 === 0 ? 12 : hours % 12;
      timeFormatted = `${pad(displayHours)}:${pad(minutes)}`;
      if (includeSeconds) {
        timeFormatted += `:${pad(seconds)}`;
      }
      timeFormatted += ` ${period}`;
    }
  }

  let finalString = dateFormatted;
  if (timeFormatted) {
    // If date format is empty, just show time, otherwise combine
    finalString = dateFormatted ? `${dateFormatted} ${timeFormatted}` : timeFormatted;
  }

  // Handle casing conversions
  if (casing === "uppercase") {
    return finalString.toUpperCase();
  } else if (casing === "lowercase") {
    return finalString.toLowerCase();
  } else if (casing === "capitalize") {
    return finalString.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return finalString;
}

export function useDateTimeFormatter(
  initialInput?: unknown,
  initialOptions?: FormatDateTimeOptions,
) {
  const [input, setInput] = useState<unknown>(initialInput);
  const [options, setOptions] = useState<FormatDateTimeOptions>(initialOptions || {});

  const date = useMemo(() => parseDateTime(input), [input]);

  const formatted = useMemo(() => {
    if (!date) return "";
    return formatDateTime(date, options);
  }, [date, options]);

  return {
    input,
    setInput,
    options,
    setOptions,
    date,
    formatted,
    format: (customInput: unknown, customOptions?: FormatDateTimeOptions) =>
      formatDateTime(customInput, customOptions ?? options),
    parse: parseDateTime,
  };
}
