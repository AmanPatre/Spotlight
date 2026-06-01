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
    <div className="fixed inset-0 z-50 bg-[#141313] text-[#e5e2e1] h-screen w-screen flex flex-col overflow-hidden font-[family-name:var(--font-geist)]">
      <LiveRoomClient
        webinarId={webinarId}
        webinarTitle={webinar.title}
        aiAgentId={webinar.aiAgentId}
        ctaType={webinar.ctaType}
        ctaLabel={webinar.ctaLabel}
        productTitle={webinar.productTitle}
        price={webinar.price}
      />
    </div>
  );
};

export default LivePage;
