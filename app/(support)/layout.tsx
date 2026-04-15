import { Metadata } from "next";
import ConditionalNavigation from '@/components/ConditionalNavigation';
import ConditionalFooter from '@/components/ConditionalFooter';
import ConditionalRootContainer from '@/components/ConditionalRootContainer';

export const metadata: Metadata = {
  title: "Support | AI MockPrep",
  description: "Support and help resources for AI MockPrep",
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ConditionalNavigation />
      <ConditionalRootContainer>
        <main className="flex-1 -mt-6">
          <div className="max-w-4xl mx-auto pb-10">
            {children}
          </div>
        </main>
        <ConditionalFooter />
      </ConditionalRootContainer>
    </div>
  );
}
