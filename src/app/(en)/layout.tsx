import "../globals.css";
import { RootHtml } from "@/components/root-html";
import { baseMetadata } from "@/lib/seo";

export { viewport } from "@/components/root-html";
export const metadata = baseMetadata("en");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootHtml locale="en">{children}</RootHtml>;
}
