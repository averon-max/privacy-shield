import SessionWrapper from "@/components/SessionWrapper";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <SessionWrapper session={null}>{children}</SessionWrapper>;
}