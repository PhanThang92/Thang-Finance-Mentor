import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ProductDuongToiTrieuDo from "@/pages/ProductDuongToiTrieuDo";
import ProductAtlas from "@/pages/ProductAtlas";
import CongDong from "@/pages/CongDong";
import TinTuc from "@/pages/TinTuc";
import TinTucArticle from "@/pages/TinTucArticle";
import Admin from "@/pages/Admin";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/cong-dong" component={CongDong} />
      <Route path="/san-pham/duong-toi-1-trieu-do" component={ProductDuongToiTrieuDo} />
      <Route path="/san-pham/atlas" component={ProductAtlas} />
      <Route path="/tin-tuc" component={() => <TinTuc />} />
      <Route path="/tin-tuc/tu-duy-dau-tu" component={() => <TinTuc catSlug="tu-duy-dau-tu" />} />
      <Route path="/tin-tuc/he-sinh-thai-san-pham" component={() => <TinTuc catSlug="he-sinh-thai-san-pham" />} />
      <Route path="/tin-tuc/san-pham/road-to-1m" component={() => <TinTuc productSlug="road-to-1m" />} />
      <Route path="/tin-tuc/san-pham/atlas" component={() => <TinTuc productSlug="atlas" />} />
      <Route path="/tin-tuc/tag/:slug" component={({ params }) => <TinTuc tagSlug={params.slug} />} />
      <Route path="/tin-tuc/:category/:slug" component={TinTucArticle} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Layout>
            <Router />
          </Layout>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
