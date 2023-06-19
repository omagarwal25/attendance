export type Color = "cyan" | "yellow" | "green" | "blue" | "red" | "magenta";

export const colors = [
  "cyan",
  "magenta",
  "yellow",
  "green",
  "blue",
  "red",
] as const;

export const stringToColor = (str: string): Color[] => {
  const split = str.split(",");

  // the split will be a result of the various colors
  return split.map((e) => e as Color);
};

export const colorToString = (colors: Color[]): string => {
  return colors.join(",");
};

export const colorToHex = (color: Color): string => {
  const colors: Record<Color, string> = {
    cyan: "#00bcd4",
    yellow: "#ffeb3b",
    green: "#4caf50",
    blue: "#2196f3",
    red: "#f44336",
    magenta: "#e91e63",
  };

  return colors[color];
};

export const hexToColor = (hex: string): Color => {
  const colors: Record<string, Color> = {
    "#00bcd4": "cyan",
    "#ffeb3b": "yellow",
    "#4caf50": "green",
    "#2196f3": "blue",
    "#f44336": "red",
    "#e91e63": "magenta",
  };

  return colors[hex] ?? "red";
};
