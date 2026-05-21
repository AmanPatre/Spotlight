import { getWebinarById } from "@/actions/webinar";
import { onAuthenticateUser } from "@/actions/auth";
import { notFound, redirect } from "next/navigation";
import LiveRoomClient from "./_components/LiveRoomClient";

type Props = {
  params: Promise<{ webinarid: string }>;
};

const LivePage = async ({ params }: Props) => {
  const { webinarid: webinarId } = await params;

  const [user, webinar] = await Promise.all([
    onAuthenticateUser(),
    getWebinarById(webinarId),
  ]);

  if (!user.user) redirect("/sign-in");
  if (!webinar) notFound();

  // Only the presenter can access the host live room
  if (webinar.presenterId !== user.user.id) {
    redirect(`/webinars/${webinarId}`);
  }

  return (
    <div className="w-full h-[calc(100vh-120px)] flex flex-col gap-4">
      {/* Page header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-primary">{webinar.title}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Host Control Room — only you can see this page
          </p>
        </div>
        <a
          href={`/webinars/${webinarId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          Open Dashboard (New Tab) ↗
        </a>
      </div>

      {/* Live room */}
      <div className="flex-1 min-h-0">
        <LiveRoomClient
          webinarId={webinarId}
          webinarTitle={webinar.title}
          aiAgentId={webinar.aiAgentId}
          ctaType={webinar.ctaType}
        />
      </div>
    </div>
  );
};

export default LivePage;
