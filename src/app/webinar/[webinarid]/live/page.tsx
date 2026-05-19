import { getWebinarById } from "@/actions/webinar";
import { notFound } from "next/navigation";
import AttendeeLiveClient from "./_components/AttendeeLiveClient";

type Props = {
  params: Promise<{ webinarid: string }>;
};

export default async function AttendeeLivePage({ params }: Props) {
  const { webinarid: webinarId } = await params;
  const webinar = await getWebinarById(webinarId);

  if (!webinar) notFound();

  return (
    <div className="h-screen bg-black text-white overflow-hidden">
      <AttendeeLiveClient
        webinarId={webinarId}
        webinarTitle={webinar.title}
        aiAgentId={webinar.aiAgentId}
      />
    </div>
  );
}
