"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const { status } = useSession();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  if (status === "loading") return <div className="flex h-screen items-center justify-center">Loading...</div>;
  
  if (status === "unauthenticated") {
      router.push("/api/auth/signin");
      return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setMessage({ type: 'success', text: `Success! Processed ${data.data.count} results across ${data.data.events.length} events: ${data.data.events.join(", ")}` });
      setFile(null); // Reset file input
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-primary">Admin Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg border-2 border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Results
            </CardTitle>
            <CardDescription>
              Upload the Excel result sheet. This will REPLACE existing results for the Event & Category found in the file.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="picture">Result Sheet (Excel)</Label>
              <div className="flex gap-2">
                <Input 
                    id="picture" 
                    type="file" 
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    disabled={uploading}
                />
              </div>
            </div>

            {file && (
                <div className="text-sm text-muted-foreground flex items-center gap-2 bg-muted p-2 rounded">
                    <FileSpreadsheet className="w-4 h-4" />
                    {file.name}
                </div>
            )}

            <Button 
                onClick={handleUpload} 
                disabled={!file || uploading} 
                className="w-full"
            >
              {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
              ) : (
                  "Upload & Sync"
              )}
            </Button>

            {message && (
              <Alert variant={message.type === 'error' ? "destructive" : "default"} className={message.type === 'success' ? "border-green-500 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-300" : ""}>
                {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{message.type === 'success' ? "Upload Complete" : "Error"}</AlertTitle>
                <AlertDescription>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-muted-foreground">
                <p>1. Ensure headers: Sl.No, Chest No., Name of the Student, CLASS, School, Grade / Mark, Place.</p>
                <p>2. <strong>Multi-Sheet:</strong> Parses all sheets (e.g., 101, 102). Event Name & Category read from top rows.</p>
                <div className="mt-2 text-xs bg-muted p-2 rounded">
                    <strong>Auto-Detection:</strong> Group events are automatically identified by keywords (e.g., &apos;Group&apos;, &apos;Oppana&apos;, &apos;Duff&apos;) in the Event Name.<br/>
                    <strong>Individual Rules:</strong> 1st=5, 2nd=3, 3rd=1. Grades: A=+5, B=+3, C=+1.<br/>
                    <strong>Group Rules:</strong> 1st=10, 2nd=6, 3rd=2. Grades: A=+10, B=+6, C=+2.
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
