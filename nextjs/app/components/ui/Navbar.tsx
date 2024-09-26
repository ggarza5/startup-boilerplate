'use client';

import { useState } from 'react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';

import { Button, buttonVariants } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { ModeToggle } from '@/components/landing/mode-toggle';
import { LogoIcon } from '@/components/landing/Icons';
import { User } from '@supabase/supabase-js';
import { createApiClient } from '@/utils/supabase/api';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import ConsultationButton from './ConsultationButton';

export const Navbar = ({ user }: { user: User | null }) => {
  const router = useRouter();
  const { toast } = useToast();
  const api = createApiClient(createClient());
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const handleAuth = async () => {
    if (user) {
      return router.push('/account');
    }
    return router.push('/auth');
  };
  return (
    <header className="sticky border-b-[1px] top-0 z-40 w-full bg-white dark:border-b-slate-700 dark:bg-background">
      <NavigationMenu className="mx-auto">
        <NavigationMenuList className="container h-14 px-4 w-screen flex justify-between ">
          <NavigationMenuItem className="font-bold flex">
            <a
              rel="noreferrer noopener"
              href="/questions"
              className="ml-2 font-bold text-xl flex"
            >
              {/* <LogoIcon /> */}
              <img
                src="/SATPracticeBotLogo-removebg.png"
                alt="SAT Practice Bot"
                className="w-8 h-8 mr-2"
              />
              {process.env.NEXT_PUBLIC_PROJECT_NAME}
            </a>
          </NavigationMenuItem>

          {/* mobile */}
          <span className="flex md:hidden">
            <ModeToggle />

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger className="px-2" asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>

              <SheetContent side={'left'}>
                <SheetHeader>
                  <SheetTitle className="font-bold text-xl">
                    {process.env.NEXT_PUBLIC_PROJECT_NAME}
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col justify-center items-center gap-2 mt-4">
                  <Button
                    variant="secondary"
                    onClick={handleAuth}
                    className={`w-[110px] border`}
                  >
                    {user ? 'Account' : 'Sign In'}
                  </Button>
                  <ConsultationButton />
                </nav>
              </SheetContent>
            </Sheet>
          </span>

          <div className="hidden md:flex gap-2">
            <ConsultationButton />
            <Button onClick={handleAuth} className={`border`} variant="outline">
              {user ? 'Account' : 'Sign In'}
            </Button>
            <ModeToggle />
          </div>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
};
