import { getDict } from "@/content/dict";
import { routeMeta } from "@/lib/seo";
import { HomeView } from "@/views/home";

const t = getDict("tr").home;
export const metadata = routeMeta("home", "tr", t.metaTitle, t.metaDesc, true);

export default function Page() {
  return <HomeView locale="tr" />;
}
