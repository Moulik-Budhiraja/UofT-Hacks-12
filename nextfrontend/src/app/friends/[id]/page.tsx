import FriendProfile from "@/components/FriendProfile";

export default function FriendProfilePage({
  params,
}: {
  params: { id: string };
}) {
  return <FriendProfile people={[]} />;
}
