import { z } from "zod";

export const shortUrlSchema = z.object({
  url: z
  .url(
    {
      error: (issue) =>
        issue.input === undefined || issue.input === null
          ? "URL is required"
          : "Invalid URL"
    }
  )
  .max(500, {error: "URL is too long"})
  .min(8, {error: "URL is too short"})

})