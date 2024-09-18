'use client';
import { LogoIcon } from './Icons';

export const Footer = () => {
  return (
    <footer id="footer">
      <hr className="w-11/12 mx-auto" />

      <section className="container py-20 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-12 gap-y-8">
        <div className="col-span-full xl:col-span-2">
          <a
            rel="noreferrer noopener"
            href="/"
            className="font-bold text-xl flex"
          >
            {/* <LogoIcon /> */}
            <img src="/SATPracticeBotLogo-removebg.png" alt="SAT Practice Bot" className="w-8 h-8 mr-2" />
            {process.env.NEXT_PUBLIC_PROJECT_NAME}
          </a>
        </div>        

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg">About</h3>
          <div>
            <a
              rel="noreferrer noopener"
              href="#"
              className="opacity-60 hover:opacity-100"
            >
              Features
            </a>
          </div>

          <div>
            <a
              rel="noreferrer noopener"
              href="#"
              className="opacity-60 hover:opacity-100"
            >
              Pricing
            </a>
          </div>

          <div>
            <a
              rel="noreferrer noopener"
              href="#"
              className="opacity-60 hover:opacity-100"
            >
              FAQ
            </a>
          </div>

          <div>
            <a
              rel="noreferrer noopener"
              href="/privacy-policy"
              className="opacity-60 hover:opacity-100"
            >
              Privacy Policy
            </a>
          </div>
          <div>
            <a
              rel="noreferrer noopener"
              href="/terms-of-service"
              className="opacity-60 hover:opacity-100"
            >
              Terms of Service
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg">Community</h3>
          <div>
            <a
              rel="noreferrer noopener"
              href="#"
              className="opacity-60 hover:opacity-100"
            >
              Youtube
            </a>
          </div>

          <div>
            <a
              rel="noreferrer noopener"
              href="#"
              className="opacity-60 hover:opacity-100"
            >
              Discord
            </a>
          </div>

          {/* <div>
            <a
              rel="noreferrer noopener"
              href="#"
              className="opacity-60 hover:opacity-100"
            >
              Twitch
            </a>
          </div> */}
          <div>
            <a
              rel="noreferrer noopener"
              href="#"
              className="opacity-60 hover:opacity-100"
            >
              X
            </a>
          </div>
        </div>
      </section>

      <section className="container pb-14 text-center">
        <h3>
          &copy; 2024 SAT Practice Platform by{' '}
          <a
            rel="noreferrer noopener"
            target="_blank"
            href="https://x.com/garzagabe"
            className="text-primary transition-all border-primary hover:border-b-2"
          >
            Gabriel Garza
          </a>
        </h3>
      </section>
    </footer>
  );
};
