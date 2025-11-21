import Hero from "@/components/Hero";
import AudioAnalyzer from "@/components/AudioAnalyzer";
import BatchAnalyzer from "@/components/BatchAnalyzer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="single" className="max-w-7xl mx-auto">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="single">Single Analysis</TabsTrigger>
            <TabsTrigger value="batch">Batch Analysis</TabsTrigger>
          </TabsList>
          <TabsContent value="single">
            <AudioAnalyzer />
          </TabsContent>
          <TabsContent value="batch">
            <BatchAnalyzer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
