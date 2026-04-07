import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ProductDuongToiTrieuDo from "@/pages/ProductDuongToiTrieuDo";
import ProductAtlas from "@/pages/ProductAtlas";
import ProductSWCPass from "@/pages/ProductSWCPass";
import CongDong from "@/pages/CongDong";
import TinTuc from "@/pages/TinTuc";
import TinTucArticle from "@/pages/TinTucArticle";
import HuyDangKy    from "@/pages/HuyDangKy";
import Admin from "@/pages/Admin";
import GioiThieu from "@/pages/GioiThieu";
import KienThuc from "@/pages/KienThuc";
import BaiViet       from "@/pages/BaiViet";
import BaiVietArticle from "@/pages/BaiVietArticle";
import Video          from "@/pages/Video";
import ChuDe       from "@/pages/ChuDe";
import Series      from "@/pages/Series";
import TaiLieu     from "@/pages/TaiLieu";
import TaiLieuDetail from "@/pages/TaiLieuDetail";
import LienHe        from "@/pages/LienHe";

const queryClient = new QueryClient();

/* Public routes — wrapped in the site Layout (Navbar + Footer) */
function PublicRoutes() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/cong-dong" component={CongDong} />
        <Route path="/san-pham/swc-pass" component={ProductSWCPass} />
        <Route path="/san-pham/duong-toi-1-trieu-do" component={ProductDuongToiTrieuDo} />
        <Route path="/san-pham/atlas" component={ProductAtlas} />
        <Route path="/gioi-thieu" component={GioiThieu} />
        <Route path="/kien-thuc" component={KienThuc} />
        <Route path="/bai-viet" component={BaiViet} />
        <Route path="/bai-viet/:slug" component={BaiVietArticle} />
        <Route path="/video" component={Video} />
        <Route path="/chu-de" component={ChuDe} />
        <Route path="/series" component={Series} />
        <Route path="/tin-tuc" component={() => <TinTuc />} />
        <Route path="/tin-tuc/tu-duy-dau-tu" component={() => <TinTuc catSlug="tu-duy-dau-tu" />} />
        <Route path="/tin-tuc/he-sinh-thai-san-pham" component={() => <TinTuc catSlug="he-sinh-thai-san-pham" />} />
        <Route path="/tin-tuc/san-pham/road-to-1m" component={() => <TinTuc productSlug="road-to-1m" />} />
        <Route path="/tin-tuc/san-pham/atlas" component={() => <TinTuc productSlug="atlas" />} />
        <Route path="/tin-tuc/tag/:slug" component={({ params }) => <TinTuc tagSlug={params.slug} />} />
        <Route path="/tin-tuc/:category/:slug" component={TinTucArticle} />
        <Route path="/tai-lieu"      component={TaiLieu} />
        <Route path="/tai-lieu/:slug" component={TaiLieuDetail} />
        <Route path="/lien-he"      component={LienHe} />
        <Route path="/huy-dang-ky" component={HuyDangKy} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Switch>
            {/* Admin has its own shell — no public Navbar/Footer */}
            <Route path="/admin" component={Admin} />
            {/* All other routes get the public Layout */}
            <Route component={PublicRoutes} />
          </Switch>
          <Toaster />
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
