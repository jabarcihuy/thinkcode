import { describe, expect, it } from "vitest";
import { youtubeVideoId } from "@/features/learning/video-url";

describe("lesson video URL", () => {
  it("accepts only a valid YouTube video URL", () => {
    expect(youtubeVideoId("https://www.youtube.com/watch?v=UhYLAtbKER0")).toBe("UhYLAtbKER0");
    expect(youtubeVideoId("https://youtu.be/0r0isf8aSy4")).toBe("0r0isf8aSy4");
    expect(youtubeVideoId("https://youtube.com.evil.test/watch?v=UhYLAtbKER0")).toBeNull();
    expect(youtubeVideoId("javascript:alert(1)")).toBeNull();
    expect(youtubeVideoId("http://youtube.com/watch?v=tfHe0qe9p44")).toBeNull();
    expect(youtubeVideoId("ftp://youtube.com/watch?v=tfHe0qe9p44")).toBeNull();
  });
});
