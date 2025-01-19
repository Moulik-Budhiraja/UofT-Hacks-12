import HomeClient, { Clip } from "./client/HomeClient";

interface HomeProps {
  dailyClips: Clip[];
  ratingUser: string;
}

const Home = ({ dailyClips, ratingUser }: HomeProps) => {
  return <HomeClient dailyClips={dailyClips} ratingUser={ratingUser} />;
};

export default Home;
