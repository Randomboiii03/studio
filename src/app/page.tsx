import { CyberTypeDefense } from '@/components/game/CyberTypeDefense';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 overflow-hidden relative">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
         <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter text-center mb-2 bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 py-2">
          CyberType Defense
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mb-6 text-center max-w-2xl">
          Type the words to destroy falling cyber threats. Activate powerful abilities by typing special keywords. How long can you survive?
        </p>
        <CyberTypeDefense />
      </div>
    </main>
  );
}
