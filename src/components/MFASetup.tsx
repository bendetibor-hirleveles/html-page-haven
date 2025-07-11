import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, QrCode, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MFASetupProps {
  onSetupComplete: () => void;
}

export function MFASetup({ onSetupComplete }: MFASetupProps) {
  const [step, setStep] = useState<'start' | 'qr' | 'verify'>('start');
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [factorId, setFactorId] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState("");
  const [secretCopied, setSecretCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const startMFASetup = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Admin 2FA'
      });

      if (error) throw error;

      if (data) {
        setQrCode(data.totp.qr_code);
        setSecret(data.totp.secret);
        setFactorId(data.id);
        setStep('qr');
      }
    } catch (error: any) {
      toast({
        title: "Hiba a 2FA beállításkor",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setSecretCopied(true);
      toast({
        title: "Másolva!",
        description: "A titkos kulcs vágólapra másolva.",
      });
      setTimeout(() => setSecretCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Másolás sikertelen",
        description: "Kérem, másolja ki manuálisan a titkos kulcsot.",
        variant: "destructive",
      });
    }
  };

  const verifyAndComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: verificationCode,
      });

      if (error) throw error;

      toast({
        title: "2FA sikeresen beállítva!",
        description: "A kétfaktoros hitelesítés aktív.",
      });
      
      onSetupComplete();
    } catch (error: any) {
      toast({
        title: "Hibás hitelesítési kód",
        description: "Ellenőrizze a kódot és próbálja újra.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Kétfaktoros hitelesítés beállítása</CardTitle>
        <CardDescription>
          Növelje fiókja biztonságát Google Authenticator segítségével
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'start' && (
          <div className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                A kétfaktoros hitelesítés jelentősen növeli fiókja biztonságát.
                Szüksége lesz a <strong>Google Authenticator</strong> alkalmazásra.
              </AlertDescription>
            </Alert>
            <Button onClick={startMFASetup} className="w-full" disabled={loading}>
              2FA beállítás indítása
            </Button>
          </div>
        )}

        {step === 'qr' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg inline-block">
                <img src={qrCode} alt="QR Code" className="w-48 h-48" />
              </div>
            </div>
            
            <div>
              <Label>Vagy írja be manuálisan a titkos kulcsot:</Label>
              <div className="flex gap-2 mt-1">
                <Input value={secret} readOnly className="font-mono text-sm" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copySecret}
                  className="px-3"
                >
                  {secretCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Alert>
              <QrCode className="h-4 w-4" />
              <AlertDescription>
                1. Telepítse a Google Authenticator alkalmazást<br/>
                2. Olvassa be a QR kódot vagy írja be a titkos kulcsot<br/>
                3. Írja be a generált 6 jegyű kódot az ellenőrzéshez
              </AlertDescription>
            </Alert>

            <Button onClick={() => setStep('verify')} className="w-full">
              Tovább az ellenőrzéshez
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <form onSubmit={verifyAndComplete} className="space-y-4">
            <div>
              <Label htmlFor="verification-code">
                Írja be a Google Authenticator kódját
              </Label>
              <Input
                id="verification-code"
                type="text"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                required
                className="text-center text-lg tracking-widest"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('qr')}
                className="flex-1"
              >
                Vissza
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                2FA aktiválása
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}