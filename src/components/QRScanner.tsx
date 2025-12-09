import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, X, AlertCircle, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose?: () => void;
  title?: string;
  description?: string;
}

export default function QRScanner({ 
  onScan, 
  onClose,
  title = "Scan QR Code",
  description = "Point your camera at a QR code"
}: QRScannerProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      // Create scanner instance
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          // QR code successfully scanned
          console.log('📷 QR Code Scanned (Camera):', result.data);
          console.log('📄 Full Result Object:', result);
          toast({
            title: "QR Code Scanned!",
            description: "Processing...",
          });
          onScan(result.data);
          stopScanning();
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment', // Use back camera
        }
      );

      scannerRef.current = scanner;
      await scanner.start();
      setIsScanning(true);
    } catch (err) {
      console.error("Scanner error:", err);
      setHasCamera(false);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions or upload an image.",
        variant: "destructive",
      });
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await QrScanner.scanImage(file, {
        returnDetailedScanResult: true,
      });
      console.log('📤 QR Code Scanned (Upload):', result.data);
      console.log('📄 Full Result Object:', result);
      toast({
        title: "QR Code Found!",
        description: "Processing image...",
      });
      onScan(result.data);
    } catch (err) {
      console.error('❌ QR Scan Failed (Upload):', err);
      toast({
        title: "No QR Code Found",
        description: "Could not detect a QR code in the image. Please try another image.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <Card data-testid="card-qr-scanner">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-scanner">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Video Preview */}
          <div className="relative rounded-lg overflow-hidden bg-black border-2 border-primary/20">
            <video
              ref={videoRef}
              className="w-full h-auto"
              style={{ 
                minHeight: '300px',
                maxHeight: '400px',
                display: isScanning ? 'block' : 'none'
              }}
            />
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted" style={{ minHeight: '300px' }}>
                <div className="text-center">
                  <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Camera preview will appear here</p>
                </div>
              </div>
            )}
          </div>

          {/* Camera Permission Error */}
          {!hasCamera && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive">Camera not available</p>
                <p className="text-muted-foreground mt-1">
                  Please enable camera permissions or upload a QR code image below.
                </p>
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="space-y-2">
            {!isScanning ? (
              <Button 
                onClick={startScanning} 
                className="w-full gap-2"
                data-testid="button-start-scan"
              >
                <Camera className="w-4 h-4" />
                Start Camera Scanning
              </Button>
            ) : (
              <Button 
                onClick={stopScanning} 
                variant="outline" 
                className="w-full"
                data-testid="button-stop-scan"
              >
                Stop Scanning
              </Button>
            )}

            {/* File Upload Option */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              data-testid="input-file-upload"
            />
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => fileInputRef.current?.click()}
              data-testid="button-upload-image"
            >
              <Upload className="w-4 h-4" />
              Upload QR Code Image
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Scan a Freedom Tag QR code or upload an image containing one
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
