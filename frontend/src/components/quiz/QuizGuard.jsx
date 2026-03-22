import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Camera, Mic, ShieldAlert, AlertTriangle, Eye } from "lucide-react";

export default function QuizGuard({ children, onViolation, onReady, active }) {
  const containerRef = useRef(null);
  const streamRef = useRef(null);
  const videoRef = useRef(null);
  const violatedRef = useRef(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [instructionsDismissed, setInstructionsDismissed] = useState(false);
  const [ready, setReady] = useState(false);

  const triggerViolation = useCallback(() => {
    if (violatedRef.current) return;
    violatedRef.current = true;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    onViolation?.();
  }, [onViolation]);

  const requestPermissions = async () => {
    setPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPermissionsGranted(true);
    } catch {
      setPermissionError(
        "Camera and microphone access are required to take this quiz. Please allow permissions and try again."
      );
    }
  };

  const enterFullscreen = useCallback(async () => {
    try {
      const el = containerRef.current || document.documentElement;
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      else if (el.msRequestFullscreen) await el.msRequestFullscreen();
    } catch {
      triggerViolation();
    }
  }, [triggerViolation]);

  const handleProceed = async () => {
    setInstructionsDismissed(true);
    await enterFullscreen();
    setReady(true);
    onReady?.();
  };

  useEffect(() => {
    if (!active || !ready) return;

    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "i") ||
        (e.ctrlKey && e.shiftKey && e.key === "J") ||
        (e.ctrlKey && e.shiftKey && e.key === "j") ||
        (e.ctrlKey && e.shiftKey && e.key === "C") ||
        (e.ctrlKey && e.shiftKey && e.key === "c") ||
        (e.ctrlKey && e.key === "u") ||
        (e.ctrlKey && e.key === "U") ||
        e.key === "F12" ||
        e.key === "PrintScreen" ||
        (e.metaKey && e.shiftKey)
      ) {
        e.preventDefault();
        e.stopPropagation();
        triggerViolation();
      }

      if (
        (e.ctrlKey && (e.key === "c" || e.key === "C")) ||
        (e.ctrlKey && (e.key === "v" || e.key === "V")) ||
        (e.ctrlKey && (e.key === "a" || e.key === "A")) ||
        (e.ctrlKey && (e.key === "x" || e.key === "X"))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    const handleCopy = (e) => e.preventDefault();
    const handlePaste = (e) => e.preventDefault();
    const handleCut = (e) => e.preventDefault();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation();
      }
    };

    const handleWindowBlur = () => {
      triggerViolation();
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && ready && !violatedRef.current) {
        triggerViolation();
      }
    };

    const handleMouseLeave = (e) => {
      if (
        e.clientY <= 0 ||
        e.clientX <= 0 ||
        e.clientX >= window.innerWidth ||
        e.clientY >= window.innerHeight
      ) {
        triggerViolation();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("contextmenu", handleContextMenu, true);
    document.addEventListener("copy", handleCopy, true);
    document.addEventListener("paste", handlePaste, true);
    document.addEventListener("cut", handleCut, true);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("contextmenu", handleContextMenu, true);
      document.removeEventListener("copy", handleCopy, true);
      document.removeEventListener("paste", handlePaste, true);
      document.removeEventListener("cut", handleCut, true);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [active, ready, triggerViolation]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  if (!active) return children;

  if (!permissionsGranted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border py-16 space-y-6 max-w-lg mx-auto">
        <ShieldAlert size={56} className="text-destructive" />
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-foreground">
            Quiz Security Check
          </h2>
          <p className="text-sm text-muted-foreground">
            Camera and microphone access are required before starting the quiz.
          </p>
        </div>
        {permissionError && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive max-w-sm text-center">
            {permissionError}
          </div>
        )}
        <Button onClick={requestPermissions} size="lg">
          <Camera size={16} className="mr-2" />
          <Mic size={16} className="mr-2" />
          Grant Camera & Microphone Access
        </Button>
      </div>
    );
  }

  if (!instructionsDismissed) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-destructive/30 bg-destructive/5 py-12 px-8 space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <Eye size={40} className="text-destructive" />
          <AlertTriangle size={40} className="text-yellow-500" />
        </div>

        <h2 className="text-2xl font-bold text-foreground text-center">
          Quiz Rules & Monitoring
        </h2>

        <Badge
          variant="destructive"
          className="text-base px-4 py-1.5 animate-pulse"
        >
          You are under watch
        </Badge>

        <div className="relative w-32 h-24 rounded-lg overflow-hidden border-2 border-destructive/40">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover scale-x-[-1]"
          />
          <div className="absolute top-1 right-1">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
          </div>
        </div>

        <div className="space-y-3 text-sm text-foreground max-w-md">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-destructive shrink-0 mt-0.5" />
            <span>
              This quiz is monitored. Your camera and microphone are active
              throughout the quiz.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-destructive shrink-0 mt-0.5" />
            <span>
              The quiz runs in <strong>strict fullscreen mode</strong>. Do not
              exit fullscreen.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-destructive shrink-0 mt-0.5" />
            <span>
              <strong>No copy/paste, screenshots, screen recording,</strong> or
              developer tools allowed.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-destructive shrink-0 mt-0.5" />
            <span>
              If your cursor leaves the screen or any system change is detected,{" "}
              <strong>
                the quiz will be immediately submitted and all 3 attempts will
                be used up.
              </strong>
            </span>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-destructive shrink-0 mt-0.5" />
            <span>
              <strong>No second chances.</strong> Any violation ends the quiz
              permanently.
            </span>
          </div>
        </div>

        <Button onClick={handleProceed} size="lg" variant="destructive">
          I Understand - Start Quiz in Fullscreen
        </Button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-background"
      style={{ userSelect: "none" }}
    >
      <div className="absolute top-3 right-3 z-50 flex items-center gap-2">
        <div className="relative w-20 h-14 rounded-md overflow-hidden border border-destructive/40 shadow-lg">
          <video
            ref={(el) => {
              videoRef.current = el;
              if (el && streamRef.current) el.srcObject = streamRef.current;
            }}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover scale-x-[-1]"
          />
          <div className="absolute top-0.5 right-0.5">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
          </div>
        </div>
        <Badge variant="destructive" className="text-xs">
          <Eye size={12} className="mr-1" /> Monitored
        </Badge>
      </div>

      <div className="p-6 pt-20">{children}</div>
    </div>
  );
}
