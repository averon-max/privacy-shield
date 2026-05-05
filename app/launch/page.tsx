import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LaunchRedirect() {
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    redirect("/app/dashboard");
  }
  redirect("/login");
}
