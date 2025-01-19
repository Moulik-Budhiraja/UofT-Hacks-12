import Home from "@/components/home";
import { getVideos } from "@/functions/getVideos";

// const defaultClips = [
//   {
//     id: "1",
//     url: "http://localhost:3000/api/videos/person_1",
//     timestamp: "00:30",
//     personId: "1",
//   },
//   {
//     id: "2",
//     url: "https://example.com/video2.mp4",
//     timestamp: "01:15",
//     personId: "2",
//   },
//   {
//     id: "3",
//     url: "https://example.com/video3.mp4",
//     timestamp: "02:00",
//     personId: "3",
//   },
// ];

export default async function RatePage() {
  const users = await getVideos();

  const videos = users.map((user) => {
    return {
      id: user.name,
      url: `/api/videos/${user.name}`,
      timestamp: "00:05",
      personId: user.name,
    };
  });

  const ratingUser = "person_1";

  console.log(videos);

  return <Home dailyClips={videos} ratingUser={ratingUser} />;
}
