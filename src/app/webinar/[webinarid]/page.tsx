import { getWebinarById } from "@/actions/webinar";
import { notFound } from "next/navigation";
import LandingPageClient from "./_components/LandingPageClient";

type Props = {
  params: Promise<{ webinarid: string }>;
};

export default async function WebinarLandingPage({ params }: Props) {
  const { webinarid: webinarId } = await params;
  const webinar = await getWebinarById(webinarId);

  if (!webinar) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/30">
      <LandingPageClient
        webinarId={webinar.id}
        title={webinar.title}
        description={webinar.description ?? ""}
        startTime={webinar.startTime}
        presenterName={webinar.presenter.name}
        webinarStatus={webinar.webinarStatus}
      />
    </div>
  );
}
