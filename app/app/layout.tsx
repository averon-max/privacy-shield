import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import SessionWrapper from "@/components/SessionWrapper";
import PageTransition from "@/components/PageTransition";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  return (
    <SessionWrapper session={session}>
      <PageTransition>{children}</PageTransition>
    </SessionWrapper>
  );
}
