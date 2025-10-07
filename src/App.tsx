import { Switch, Route } from "wouter";
import React from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/lib/cart-store";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Category from "@/pages/category";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import OrderReview from "@/pages/order-review";
import Menu from "@/pages/menu";
import AdminComplete from "@/pages/admin-complete";
import Header from "@/components/header";
import BottomNav from "@/components/bottom-nav";

function Router() {
  return (
    <Switch>
      <Route path="/admin" component={AdminComplete} />
      <Route path="/" component={Home} />
      <Route path="/category/:category" component={Category} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order-review/:data" component={OrderReview} />
      <Route path="/menu" component={Menu} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const isAdmin = window.location.pathname.startsWith('/admin');

  if (isAdmin) {
    // Admin layout - full screen
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            <Router />
            <Toaster />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Public layout - mobile-first with cart
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <div className="max-w-md mx-auto bg-background min-h-screen relative">
            <Header />
            <main className="pb-20">
              <Router />
            </main>
            <BottomNav />
            <Toaster />
          </div>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
