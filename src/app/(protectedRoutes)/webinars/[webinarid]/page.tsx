import { getWebinarById } from "@/actions/webinar";
import { getWebinarAttendence } from "@/actions/attendence";
import { notFound } from "next/navigation";
import WebinarDetailClient from "./_components/WebinarDetailClient";

type Props = {
  params: Promise<{ webinarid: string }>;
};

const WebinarDetailPage = async ({ params }: Props) => {
  const { webinarid: webinarId } = await params;

  const [webinar, pipelineData] = await Promise.all([
    getWebinarById(webinarId),
    getWebinarAttendence(webinarId),
  ]);

  if (!webinar) {
    notFound();
  }

  return <WebinarDetailClient webinar={webinar} pipelineData={pipelineData} />;
};

export default WebinarDetailPage;