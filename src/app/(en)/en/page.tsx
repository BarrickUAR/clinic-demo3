import { getDict } from "@/content/dict";
import { routeMeta } from "@/lib/seo";
import { HomeView } from "@/views/home";

const t = getDict("en").home;
export const metadata = routeMeta("home", "en", t.metaTitle, t.metaDesc, true);

export default function Page() {
  return <HomeView locale="en" />;
}
