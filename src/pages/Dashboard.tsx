import Header from "@/components/Header";
import AudioAnalyzer from "@/components/AudioAnalyzer";
import BatchAnalyzer from "@/components/BatchAnalyzer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Forensic Audio Analysis</h1>
            <p className="text-muted-foreground">
              Analyze audio files with forensic-grade AI detection — free and open to everyone
            </p>
          </div>

          <Tabs defaultValue="single" className="w-full">
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
    </div>
  );
};

export default Dashboard;
