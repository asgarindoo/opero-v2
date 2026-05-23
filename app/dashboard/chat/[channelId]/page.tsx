import ChatChannelPage from "@/features/chat/components/ChatChannelPage";

// Resolve params on the server so ChatChannelPage receives a plain string.
// Passing params as a Promise forces ChatChannelPage to use React.use(), which
// suspends the component and places it inside a Suspense boundary. That
// boundary prevents React context updates (like realtime message appends from
// ChatProvider) from propagating to MessageList during concurrent rendering.
export default async function Page({
  params,
}: {
  params: Promise<{ channelId: string }>;
}) {
  const { channelId } = await params;
  return <ChatChannelPage channelId={channelId} />;
}
