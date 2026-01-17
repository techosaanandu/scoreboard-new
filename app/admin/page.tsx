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
  const [categoryNo, setCategoryNo] = useState<string>('');
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
    if (!file || !categoryNo) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('categoryNo', categoryNo);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setMessage({ 
        type: 'success', 
        text: `Success! Processed ${data.data.count} results for Category ${categoryNo} across ${data.data.events.length} events.` 
      });
      setFile(null);
      setCategoryNo('');
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
              Upload Excel sheet. Matches on Event Name + Category Number. If the Category Number is new, it adds the data. If it exists, it replaces it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="picture">Result Sheet (Excel)</Label>
              <Input 
                  id="picture" 
                  type="file" 
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  disabled={uploading}
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="categoryNo">Category Number</Label>
              <Input 
                  id="categoryNo" 
                  type="number" 
                  placeholder="e.g. 1, 2, 3"
                  value={categoryNo}
                  onChange={(e) => setCategoryNo(e.target.value)}
                  disabled={uploading}
              />
            </div>

            {file && (
                <div className="text-sm text-muted-foreground flex items-center gap-2 bg-muted p-2 rounded">
                    <FileSpreadsheet className="w-4 h-4" />
                    {file.name}
                </div>
            )}

            <Button 
                onClick={handleUpload} 
                disabled={!file || !categoryNo || uploading} 
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
                <CardTitle>Data Logic</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4 text-muted-foreground">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                    <p className="font-bold text-blue-800 dark:text-blue-300 mb-1">Upload Behavior:</p>
                    <ul className="list-disc ml-4 space-y-1">
                        <li>System checks <strong>Event Name</strong> (from Excel) + <strong>Category Number</strong> (from input).</li>
                        <li>If this specific combination exists, it is <strong>replaced</strong>.</li>
                        <li>If the Category Number is different, the data is <strong>added</strong> as a new set of results.</li>
                    </ul>
                </div>
                <div className="text-xs bg-muted p-2 rounded">
                    <strong>Points System:</strong><br/>
                    Individual: 1st=5, 2nd=3, 3rd=1 | Grade A=5, B=3, C=1<br/>
                    Group: 1st=10, 2nd=6, 3rd=2 | Grade A=10, B=6, C=2
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}