import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { buttonVariants } from '@/components/ui/button';
import { Linkedin } from 'lucide-react';

const GabrielCard = ({ className }: { className?: string }) => {
  return (
    <Card
      className={`justify-center items-center drop-shadow-xl shadow-black/10 dark:shadow-white/10 ${className}`}
    >
      <CardHeader className="mt-8 flex justify-center items-center pb-2">
        <img
          src="/landing/gabriel.jpeg"
          alt="user avatar"
          className="absolute grayscale-[0%] -top-12 rounded-full w-24 h-24 aspect-square object-cover"
        />
        <CardTitle className="text-center">Gabriel Garza</CardTitle>
        <CardDescription className="font-normal text-primary text-center">
          Stanford University Graduate
        </CardDescription>
      </CardHeader>

      <CardContent className="text-center pb-2">
        <p>Every student deserves to reach their potential.</p>
      </CardContent>

      <CardFooter>
        <div>
          <a
            rel="noreferrer noopener"
            href="https://github.com/ggarza5"
            target="_blank"
            className={buttonVariants({
              variant: 'ghost',
              size: 'sm'
            })}
          >
            <span className="sr-only">Github icon</span>
            <GitHubLogoIcon className="w-5 h-5" />
          </a>
          <a
            rel="noreferrer noopener"
            href="https://twitter.com/garzagabe"
            target="_blank"
            className={buttonVariants({
              variant: 'ghost',
              size: 'sm'
            })}
          >
            <span className="sr-only">X icon</span>
            <svg
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="fill-foreground w-5 h-5"
            >
              <title>X</title>
              <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
            </svg>
          </a>

          <a
            rel="noreferrer noopener"
            href="https://www.linkedin.com/in/gabriel-a-garza/"
            target="_blank"
            className={buttonVariants({
              variant: 'ghost',
              size: 'sm'
            })}
          >
            <span className="sr-only">Linkedin icon</span>
            <Linkedin size="20" />
          </a>
        </div>
      </CardFooter>
    </Card>
  );
};

export default GabrielCard;
