import { getWebinarById } from "@/actions/webinar";
import { notFound, redirect } from "next/navigation";
import CallClientShell from "./_components/CallClientShell";

type Props = {
  params: Promise<{ webinarid: string }>;
};

export default async function WebinarCallPage({ params }: Props) {
  const { webinarid } = await params;
  const webinar = await getWebinarById(webinarid);

  if (!webinar) notFound();

  if (!webinar.aiAgentId) {
    redirect(`/webinar/${webinarid}/live`);
  }

  return (
    <CallClientShell webinarId={webinarid} assistantId={webinar.aiAgentId} />
  );
}
