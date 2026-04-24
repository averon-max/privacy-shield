import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import SessionWrapper from "@/components/SessionWrapper";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  return <SessionWrapper session={session}>{children}</SessionWrapper>;
}