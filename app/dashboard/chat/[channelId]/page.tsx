import ChatChannelPage from "@/features/chat/components/ChatChannelPage";

export default function Page({ params }: { params: Promise<{ channelId: string }> }) {
  return <ChatChannelPage params={params} />;
}
