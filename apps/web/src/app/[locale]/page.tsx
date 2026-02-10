import { useTranslations } from 'next-intl';
import { Button } from '@repo/ui/components';

export default function Index() {
  const t = useTranslations('Index');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          {t('title')}
        </h1>
        <p className="mt-3 text-2xl">
          {t('description')}
        </p>
        <div className="mt-6 flex gap-4">
             <Button>Click me</Button>
             <Button variant="outline">Secondary</Button>
        </div>
      </main>
    </div>
  );
}
