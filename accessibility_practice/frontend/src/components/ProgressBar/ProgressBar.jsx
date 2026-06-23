import { Progress } from "@chakra-ui/react";

/**
 * Labeled progress bar for deck/study completion.
 * Renders Chakra's accessible Progress (role="progressbar" with aria values).
 */
export function ProgressBar({ label = "Progress", value, colorPalette = "blue", showValue = true }) {
  return (
    <Progress.Root value={value} colorPalette={colorPalette} maxW="sm">
      <Progress.Label>{label}</Progress.Label>
      <Progress.Track>
        <Progress.Range />
      </Progress.Track>
      {showValue && <Progress.ValueText />}
    </Progress.Root>
  );
}
